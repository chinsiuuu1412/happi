(() => {
  "use strict";

  const requiredIds = [
    "game", "stage", "start-button", "continue-button", "sound-toggle", "music",
    "rabbit", "cat", "plane", "door", "gift-layer", "fog",
    "cat-media", "plane-media", "door-media",
    "intro-question", "gift-question", "gift-ready-line", "first-thought",
    "thought-line", "anniversary-title", "scene-status", "envelope", "letter",
  ];

  function init() {
    const elements = Object.fromEntries(
      requiredIds.map((id) => [id, document.getElementById(id)])
    );
    const game = elements.game;
    const roomRabbit = game?.querySelector(".room--rabbit");
    const roomCat = game?.querySelector(".room--cat");
    const panels = new Map(
      Array.from(game?.querySelectorAll("[data-panel]") ?? [], (panel) => [panel.dataset.panel, panel])
    );
    const scenes = [
      "start", "intro", "gift", "gift-ready", "flight",
      "thought", "thought-reveal", "reunion", "envelope", "letter",
    ];
    const missing = requiredIds.filter((id) => !elements[id]);
    if (!roomRabbit) missing.push(".room--rabbit");
    if (!roomCat) missing.push(".room--cat");
    for (const name of scenes) {
      if (!panels.has(name)) missing.push('data-panel="' + name + '"');
    }
    if (missing.length) {
      console.error("Thiếu phần tử để khởi tạo thiệp:", missing.join(", "));
      return;
    }

    const {
      stage, rabbit, cat, plane, door, fog, music, envelope, letter,
      "gift-layer": giftLayer,
      "continue-button": continueButton,
      "sound-toggle": soundToggle,
      "thought-line": thoughtLine,
      "scene-status": sceneStatus,
    } = elements;
    const fullThought = thoughtLine.textContent.trim();
    const normalSoundLabel = soundToggle.textContent.trim();
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const styles = window.getComputedStyle(document.documentElement);
    const duration = {
      entry: readDuration("--duration-entry", 180),
      fog: readDuration("--duration-transition", 320),
      door: readDuration("--duration-door", 650),
      title: readDuration("--duration-title", 200),
      flight: 3000,
      character: 24,
      reading: 650,
      readingReduced: 1800,
      beforeDoor: 200,
      rabbitEntry: readDuration("--duration-rabbit-entry", 900),
      giftLoadLimit: 1200,
    };
    const state = {
      scene: "start",
      gift: null,
      giftReady: false,
      canContinue: false,
      busy: false,
      muted: false,
      musicFailed: false,
      autoplayBlocked: false,
      musicPending: false,
    };
    let bellAudio;
    let bellOutput;
    let giftPanelEntry;
    let swipe;
    let suppressEnvelopeClick = false;

    function readDuration(property, fallback) {
      const value = styles.getPropertyValue(property).trim();
      const milliseconds = /^([0-9.]+)(ms|s)$/.exec(value);
      if (!milliseconds) return fallback;
      return Number(milliseconds[1]) * (milliseconds[2] === "s" ? 1000 : 1);
    }

    function wait(milliseconds) {
      return milliseconds > 0
        ? new Promise((resolve) => window.setTimeout(resolve, milliseconds))
        : Promise.resolve();
    }

    function motionTime(milliseconds) {
      return reducedMotion.matches ? 0 : milliseconds;
    }

    function announce(message) {
      sceneStatus.textContent = message;
    }

    function hideImageOnError(image) {
      if (!image) return;
      image.addEventListener("error", () => { image.hidden = true; }, { once: true });
      // A detached template image can report complete before it starts loading.
      if (image.isConnected && image.complete && image.naturalWidth === 0) image.hidden = true;
    }

    function mountSceneImages(layer, template, priority = "auto") {
      if (layer.querySelector("img")) return;
      for (const source of template.content.children) {
        const image = source.cloneNode(true);
        image.fetchPriority = priority;
        hideImageOnError(image);
        layer.append(image);
        if (typeof image.decode === "function") void image.decode().catch(() => {});
      }
    }

    function showContinue(visible) {
      state.canContinue = visible;
      continueButton.hidden = !visible;
      if (visible && document.activeElement !== soundToggle) continueButton.focus();
    }

    function setScene(name) {
      state.scene = name;
      game.dataset.scene = name;
      showContinue(false);

      const preparing = name === "intro" || name === "gift" || name === "gift-ready";
      const atDoor = name === "door-opening" || name === "rabbit-entry" || name === "reunion";
      const atCatRoom = name === "thought" || name === "thought-reveal" || atDoor;

      for (const [panelName, panel] of panels) panel.hidden = panelName !== name;
      roomRabbit.hidden = !preparing;
      roomCat.hidden = !atCatRoom;
      rabbit.hidden = !preparing && name !== "rabbit-entry" && name !== "reunion";
      cat.hidden = !atCatRoom;
      door.hidden = !atDoor;
      giftLayer.hidden = !state.giftReady || rabbit.hidden;

      if (name === "intro") {
        mountSceneImages(plane, elements["plane-media"]);
      } else if (name === "gift") {
        mountSceneImages(cat, elements["cat-media"], "low");
        mountSceneImages(door, elements["door-media"], "low");
      }

      if (name === "intro" || name === "gift") {
        const question = name === "intro" ? elements["intro-question"] : elements["gift-question"];
        announce(question.textContent.trim());
        panels.get(name).querySelector("[data-action]")?.focus();
      }
    }

    async function transitionWithFog(nextScene) {
      if (reducedMotion.matches) {
        setScene(nextScene);
        return;
      }

      fog.hidden = false;
      // Commit the starting opacity before the cover transition.
      fog.getBoundingClientRect();
      fog.classList.add("is-covered");
      await wait(motionTime(duration.fog));
      setScene(nextScene);
      fog.classList.remove("is-covered");
      await wait(motionTime(duration.fog));
      fog.hidden = true;
    }

    function syncSound() {
      music.muted = state.muted;
      if (bellOutput) bellOutput.gain.value = state.muted ? 0 : 1;

      const canRetryMusic = (!state.muted && state.autoplayBlocked) || (state.muted && state.musicFailed);
      soundToggle.textContent = canRetryMusic ? "Bật nhạc" : normalSoundLabel;
      if (canRetryMusic) soundToggle.removeAttribute("aria-pressed");
      else soundToggle.setAttribute("aria-pressed", String(state.muted));
    }

    function primeDoorbell() {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) return;

      try {
        if (!bellAudio) {
          const audio = new Audio();
          const output = audio.createGain();
          output.gain.value = state.muted ? 0 : 1;
          output.connect(audio.destination);
          bellAudio = audio;
          bellOutput = output;
        }
        if (bellAudio.state !== "running") bellAudio.resume().catch(() => {});
      } catch {
        // A device that cannot create an audio context still runs the story.
      }
    }

    function handleMusicError() {
      state.musicFailed = true;
      state.autoplayBlocked = false;
      syncSound();
    }

    async function playMusic(retry = false) {
      if (state.musicPending) return;
      state.musicPending = true;
      try {
        if (retry && music.error) music.load();
        await music.play();
        state.musicFailed = false;
        state.autoplayBlocked = false;
      } catch (error) {
        if (error?.name === "NotAllowedError") state.autoplayBlocked = true;
        else handleMusicError();
      } finally {
        state.musicPending = false;
        syncSound();
      }
    }

    function toggleSound() {
      if (state.autoplayBlocked && !state.muted) {
        primeDoorbell();
        void playMusic();
        return;
      }
      state.muted = !state.muted;
      syncSound();
      if (state.muted) return;

      primeDoorbell();
      if (state.musicFailed) void playMusic(true);
    }

    function tryMusicOnInteraction(event) {
      if (!state.autoplayBlocked || state.muted || event.isTrusted === false) return;
      if (event.type === "keydown" && (event.repeat || (event.key !== "Enter" && event.key !== " "))) return;
      if (event.target?.closest?.("button") === soundToggle) return;
      void playMusic();
    }

    function ringDoorbell() {
      if (state.muted || bellAudio?.state !== "running") return;

      const now = bellAudio.currentTime;
      try {
        [740, 554].forEach((frequency, index) => {
          const at = now + index * 0.19;
          const tone = bellAudio.createOscillator();
          const level = bellAudio.createGain();

          tone.frequency.value = frequency;
          level.gain.setValueAtTime(0.14, at);
          level.gain.exponentialRampToValueAtTime(0.001, at + 0.28);
          tone.connect(level);
          level.connect(bellOutput);
          tone.start(at);
          tone.stop(at + 0.28);
        });
      } catch {
        // The door reveal continues if the device cannot schedule the chime.
      }
    }

    function start() {
      primeDoorbell();
      setScene("intro");
    }

    async function prepareGiftImage(image) {
      let timeout;
      const loaded = typeof image.decode === "function"
        ? image.decode()
        : (image.complete && image.naturalWidth > 0
          ? Promise.resolve()
          : new Promise((resolve) => image.addEventListener("load", resolve, { once: true })));
      const ready = loaded.then(() => {
        state.giftReady = true;
        giftLayer.hidden = rabbit.hidden;
        return true;
      }, () => false);
      const deadline = new Promise((resolve) => {
        timeout = window.setTimeout(() => resolve(false), duration.giftLoadLimit);
      });
      try {
        return await Promise.race([ready, deadline]);
      } finally {
        window.clearTimeout(timeout);
      }
    }

    async function chooseGift(button) {
      const { gift, image: imagePath } = button.dataset;
      if (!gift || !imagePath) return;

      state.busy = true;
      state.gift = gift;
      giftLayer.dataset.gift = gift;

      const image = document.createElement("img");
      image.alt = button.textContent.trim();
      image.fetchPriority = "high";
      hideImageOnError(image);
      image.src = imagePath;
      giftLayer.replaceChildren(image);

      setScene("gift-ready");
      announce(elements["gift-ready-line"].textContent.trim());
      if (await prepareGiftImage(image)) await wait(motionTime(duration.entry));
      state.busy = false;
      showContinue(true);
    }

    async function revealThought() {
      thoughtLine.textContent = "";
      setScene("thought-reveal");

      if (!reducedMotion.matches) {
        let first = true;
        for (const character of fullThought) {
          if (!first) await wait(reducedMotion.matches ? 0 : duration.character);
          if (reducedMotion.matches) break;
          thoughtLine.textContent += character;
          first = false;
        }
      }

      thoughtLine.textContent = fullThought;
      announce(fullThought);
      await wait(reducedMotion.matches ? duration.readingReduced : duration.reading);

      ringDoorbell();
      showContinue(true);
    }

    async function welcomeRabbit() {
      setScene("door-opening");
      await wait(motionTime(duration.beforeDoor));
      door.classList.add("is-open");
      await wait(motionTime(duration.door));

      setScene("rabbit-entry");
      await wait(motionTime(duration.rabbitEntry));
      setScene("reunion");
      announce(elements["anniversary-title"].textContent.trim());
      await wait(motionTime(duration.title));
      showContinue(true);
    }

    async function continueStory() {
      if (state.busy || !state.canContinue) return;
      state.busy = true;
      showContinue(false);

      try {
        switch (state.scene) {
          case "gift-ready":
            await transitionWithFog("flight");
            await wait(duration.flight);
            showContinue(true);
            break;
          case "flight":
            await transitionWithFog("thought");
            announce(elements["first-thought"].textContent.trim());
            showContinue(true);
            break;
          case "thought":
            await revealThought();
            break;
          case "thought-reveal":
            await welcomeRabbit();
            break;
          case "reunion":
            setScene("envelope");
            envelope.focus();
            break;
        }
      } finally {
        state.busy = false;
      }
    }

    async function openLetter() {
      if (state.scene !== "envelope" || state.busy) return;
      state.busy = true;
      envelope.classList.add("is-opening");
      await wait(motionTime(duration.fog));
      setScene("letter");
      envelope.classList.remove("is-opening");
      letter.focus();
      state.busy = false;
    }

    function isRepeatedGiftTap(event) {
      if (!giftPanelEntry || event.detail === 0) return false;

      const elapsed = event.timeStamp - giftPanelEntry.time;
      const distance = Math.hypot(event.clientX - giftPanelEntry.x, event.clientY - giftPanelEntry.y);
      return elapsed >= 0 && elapsed < 300 && distance <= 24;
    }

    function handleClick(event) {
      const target = event.target;
      const button = target.closest?.("button");
      if (!button) {
        if (stage.contains(target)) void continueStory();
        return;
      }
      if (button.disabled || button.closest("[hidden]")) return;

      const action = button.dataset.action;
      if (action === "toggle-sound") {
        toggleSound();
        return;
      }
      if (state.busy) return;

      switch (action) {
        case "start":
          if (state.scene === "start") start();
          break;
        case "accept-surprise":
          if (state.scene === "intro") {
            if (event.detail > 0) {
              giftPanelEntry = { time: event.timeStamp, x: event.clientX, y: event.clientY };
            }
            setScene("gift");
          }
          break;
        case "choose-gift":
          if (state.scene === "gift" && !isRepeatedGiftTap(event)) void chooseGift(button);
          break;
        case "continue":
          void continueStory();
          break;
        case "open-letter":
          if (event.detail === 0 || !suppressEnvelopeClick) void openLetter();
          break;
      }
    }

    function beginSwipe(event) {
      if (state.scene !== "envelope" || state.busy || !event.isPrimary || event.button !== 0) return;
      suppressEnvelopeClick = false;
      swipe = { id: event.pointerId, x: event.clientX, y: event.clientY };
      envelope.setPointerCapture(event.pointerId);
    }

    function endSwipe(event) {
      if (swipe?.id !== event.pointerId) return;
      const horizontal = Math.abs(event.clientX - swipe.x);
      const upward = swipe.y - event.clientY;
      swipe = null;
      suppressEnvelopeClick = Math.max(horizontal, Math.abs(upward)) >= 12;

      if (upward >= 35 && upward > horizontal) void openLetter();
    }

    function cancelSwipe(event) {
      if (swipe?.id !== event.pointerId) return;
      swipe = null;
      suppressEnvelopeClick = true;
    }

    game.addEventListener("click", handleClick);
    game.addEventListener("keydown", (event) => {
      if (event.repeat && (event.key === "Enter" || event.key === " ") &&
          event.target.closest?.("[data-action]")) {
        event.preventDefault();
      }
    });
    envelope.addEventListener("pointerdown", beginSwipe);
    envelope.addEventListener("pointerup", endSwipe);
    envelope.addEventListener("pointercancel", cancelSwipe);
    envelope.addEventListener("lostpointercapture", cancelSwipe);
    music.addEventListener("error", handleMusicError);
    window.addEventListener("click", tryMusicOnInteraction, true);
    window.addEventListener("keydown", tryMusicOnInteraction, true);

    hideImageOnError(rabbit.querySelector("img"));
    setScene("start");
    soundToggle.hidden = false;
    syncSound();
    void playMusic();
  }

  init();
})();
