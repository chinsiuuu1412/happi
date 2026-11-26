(() => {
  "use strict";

  const requiredIds = [
    "game", "stage", "start-button", "continue-button", "sound-toggle", "music",
    "rabbit", "cat", "plane", "door", "gift-layer", "fog",
    "cat-media", "plane-media", "door-media",
    "intro-question", "gift-question", "gift-ready-line", "first-thought",
    "thought-line", "anniversary-title", "scene-status", "envelope", "letter",
    "letter-stamp", "replay-button", "download-png-button", "download-video-button",
    "previous-video-button", "recording-indicator", "video-status", "png-status",
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
      "download-png-button": pngButton,
      "download-video-button": videoButton,
      "previous-video-button": previousVideoButton,
      "recording-indicator": recordingIndicator,
      "video-status": videoStatus,
      "png-status": pngStatus,
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
    let musicSource;
    let recording;
    let savedVideo;
    let videoMessage = "";

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
      beginRecording();
      setScene("intro");
      updateVideoControls();
    }

    async function prepareGiftImage(image) {
      let timeout;
      const loaded = typeof image.decode === "function"
        ? image.decode()
        : (image.complete && image.naturalWidth > 0
          ? Promise.resolve()
          : new Promise((resolve) => image.addEventListener("load", resolve, { once: true })));
      const ready = loaded.then(() => {
        if (giftLayer.querySelector("img") !== image) return false;
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
      finishRecordingAfterLetter();
    }

    function replay() {
      if (state.scene !== "letter") return;

      if (recording && !recording.stopping) {
        const still = document.createElement("canvas");
        still.width = recording.canvas.width;
        still.height = recording.canvas.height;
        const context = still.getContext("2d");
        if (context) {
          context.drawImage(recording.canvas, 0, 0);
          recording.still = still;
        }
      }

      state.gift = null;
      state.giftReady = false;
      giftPanelEntry = null;
      swipe = null;
      suppressEnvelopeClick = false;
      delete giftLayer.dataset.gift;
      giftLayer.replaceChildren();
      door.classList.remove("is-open");
      fog.classList.remove("is-covered");
      fog.hidden = true;
      thoughtLine.textContent = fullThought;
      letter.scrollTop = 0;
      pngStatus.textContent = "";
      announce("");
      setScene("start");
      updateVideoControls();
      elements["start-button"].focus();
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
        case "replay":
          replay();
          break;
        case "download-png":
          if (state.scene === "letter") void downloadLetterPng();
          break;
        case "download-video":
          if (savedVideo) saveBlob(savedVideo.blob, savedVideo.filename);
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

    function saveBlob(blob, filename) {
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
    }

    function wrapText(context, text, width) {
      const lines = [];
      for (const row of text.split("\n")) {
        let line = "";
        for (const word of row.trim().split(/\s+/)) {
          const joined = line ? line + " " + word : word;
          if (line && context.measureText(joined).width > width) {
            lines.push(line);
            line = word;
          } else {
            line = joined;
          }
        }
        lines.push(line);
      }
      return lines;
    }

    function makeLetterArt(stamp) {
      const canvas = document.createElement("canvas");
      canvas.width = 720;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Không mở được Canvas.");

      const padding = 46;
      const lineHeight = 43;
      const stampWidth = stamp ? 125 : 0;
      const stampHeight = stamp ? Math.round(stampWidth * stamp.naturalHeight / stamp.naturalWidth) : 0;
      const stampX = canvas.width - padding - stampWidth;
      const letterStyle = window.getComputedStyle(letter);
      const font = "30px " + letterStyle.fontFamily;
      const paragraphs = letter.querySelectorAll(".letter-body > p");
      const positionedLines = [];
      let y = padding;

      context.font = font;
      for (const paragraph of paragraphs) {
        const text = Array.from(paragraph.childNodes, (node) =>
          node.nodeName === "BR" ? "\n" : node.textContent
        ).join("").trim();
        const available = stamp && y < padding + stampHeight + 22
          ? stampX - padding - 22
          : canvas.width - 2 * padding;
        for (const line of wrapText(context, text, available)) {
          positionedLines.push({ line, y });
          y += lineHeight;
        }
        y += 14;
      }

      canvas.height = Math.ceil(Math.max(y, padding + stampHeight) + padding - 14);
      context.fillStyle = styles.getPropertyValue("--color-paper").trim() || "#FFF4E3";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = styles.getPropertyValue("--color-ink").trim() || "#3F2736";
      context.font = font;
      context.textBaseline = "top";
      for (const line of positionedLines) context.fillText(line.line, padding, line.y);
      if (stamp) {
        context.drawImage(stamp, stampX, padding, stampWidth, stampHeight);
        context.strokeStyle = styles.getPropertyValue("--color-seal").trim() || "#A32D4E";
        context.setLineDash([5, 4]);
        context.strokeRect(stampX - 5, padding - 5, stampWidth + 10, stampHeight + 10);
      }
      return canvas;
    }

    async function downloadLetterPng() {
      if (pngButton.disabled) return;
      pngButton.disabled = true;
      pngStatus.textContent = "Đang tạo PNG…";
      try {
        const stamp = elements["letter-stamp"].querySelector("img");
        await document.fonts?.ready;
        if (stamp && typeof stamp.decode === "function") await stamp.decode();
        if (stamp && !stamp.naturalWidth) throw new Error("Ảnh tem chưa tải được.");
        const art = makeLetterArt(stamp);
        const blob = await new Promise((resolve) => art.toBlob(resolve, "image/png"));
        if (!blob?.size) throw new Error("PNG trống.");
        saveBlob(blob, "thiep-anni.png");
        pngStatus.textContent = "";
      } catch {
        pngStatus.textContent = "Chưa tạo được PNG. Hãy đợi ảnh tem tải xong rồi thử lại.";
      } finally {
        pngButton.disabled = false;
      }
    }

    function updateVideoControls() {
      videoButton.disabled = !savedVideo;
      previousVideoButton.hidden = state.scene !== "start" || !savedVideo;
      recordingIndicator.hidden = !recording || recording.stopping || state.scene === "start";
      videoStatus.textContent = videoMessage;
    }

    function captureAudio(session) {
      if (!bellAudio?.createMediaStreamDestination || !bellAudio.createMediaElementSource) return;
      try {
        const output = bellAudio.createMediaStreamDestination();
        const track = output.stream.getAudioTracks()[0];
        if (!track) return;
        if (!musicSource) {
          musicSource = bellAudio.createMediaElementSource(music);
          musicSource.connect(bellOutput);
        }
        bellOutput.connect(output);
        session.audio = output;
        session.stream.addTrack(track);
      } catch {
        // Video can still be saved if this browser cannot mix the page audio.
      }
    }

    function releaseRecording(session) {
      window.clearTimeout(session.finishTimer);
      window.cancelAnimationFrame(session.frame);
      if (session.audio) bellOutput.disconnect(session.audio);
      if (session.stream) {
        for (const track of session.stream.getTracks()) track.stop();
      }
    }

    function completeRecording(session) {
      releaseRecording(session);
      if (recording !== session) return;

      recording = null;
      const type = (session.recorder.mimeType || session.parts[0]?.type || "").split(";")[0];
      if (session.parts.length && (type === "video/mp4" || type === "video/webm")) {
        savedVideo = {
          blob: new Blob(session.parts, { type }),
          filename: "luot-choi-anni." + (type === "video/mp4" ? "mp4" : "webm"),
        };
        videoMessage = session.stream.getAudioTracks().length
          ? "Video đã sẵn sàng."
          : "Video đã sẵn sàng. Trình duyệt này ghi được phần hình.";
      } else {
        videoMessage = "Chưa lưu được video. Bạn vẫn có thể tải thiệp PNG.";
      }
      updateVideoControls();
    }

    function stopRecording(session) {
      if (session.stopping) return;
      session.stopping = true;
      window.clearTimeout(session.finishTimer);
      window.cancelAnimationFrame(session.frame);
      if (session.recorder.state === "inactive") completeRecording(session);
      else session.recorder.stop();
      updateVideoControls();
    }

    function discardRecording() {
      if (!recording) return;
      const previous = recording;
      recording = null;
      stopRecording(previous);
    }

    function failRecording(session) {
      if (recording === session) {
        recording = null;
        videoMessage = "Trình duyệt không quay được video của lượt này.";
        updateVideoControls();
      }
      if (session.recorder && session.recorder.state !== "inactive") stopRecording(session);
      else releaseRecording(session);
    }

    function beginRecording() {
      discardRecording();
      savedVideo = null;
      videoMessage = "";
      if (typeof window.MediaRecorder !== "function") {
        videoMessage = "Trình duyệt này chưa hỗ trợ quay video.";
        updateVideoControls();
        return;
      }

      const canvas = document.createElement("canvas");
      const session = { canvas, parts: [], nextFrameAt: 0, stopping: false };
      recording = session;
      try {
        const bounds = stage.getBoundingClientRect();
        const scale = Math.min(2, 1280 / bounds.width, 960 / bounds.height);
        canvas.width = Math.max(2, Math.round(bounds.width * scale / 2) * 2);
        canvas.height = Math.max(2, Math.round(bounds.height * scale / 2) * 2);
        const context = canvas.getContext("2d", { alpha: false });
        if (!context || typeof canvas.captureStream !== "function") throw new Error("Canvas capture");

        const paint = makeGamePainter(context);
        paint(0);
        session.stream = canvas.captureStream(24);
        captureAudio(session);
        const formats = ["video/mp4", "video/webm;codecs=vp8,opus", "video/webm"];
        const mimeType = formats.find((format) => window.MediaRecorder.isTypeSupported?.(format));
        const options = { videoBitsPerSecond: 1_500_000 };
        if (mimeType) options.mimeType = mimeType;
        session.recorder = new window.MediaRecorder(session.stream, options);
        session.recorder.addEventListener("dataavailable", (event) => {
          if (event.data.size) session.parts.push(event.data);
        });
        session.recorder.addEventListener("stop", () => completeRecording(session), { once: true });
        session.recorder.addEventListener("error", () => failRecording(session), { once: true });
        session.recorder.start(1000);

        function recordFrame(timestamp) {
          if (recording !== session || session.stopping) return;
          try {
            if (timestamp >= session.nextFrameAt) {
              if (session.still) context.drawImage(session.still, 0, 0);
              else paint(timestamp);
              session.nextFrameAt = timestamp + 1000 / 24;
            }
            session.frame = window.requestAnimationFrame(recordFrame);
          } catch {
            failRecording(session);
          }
        }
        session.paint = paint;
        session.frame = window.requestAnimationFrame(recordFrame);
      } catch {
        failRecording(session);
      }
      updateVideoControls();
    }

    function finishRecordingAfterLetter() {
      const session = recording;
      if (!session || session.stopping) return;
      videoMessage = "Đang hoàn tất video…";
      // Paint the reveal now even if the viewer immediately chooses replay.
      try {
        session.paint(0);
        session.finishTimer = window.setTimeout(() => stopRecording(session), 2000);
      } catch {
        failRecording(session);
      }
      updateVideoControls();
    }

    function makeGamePainter(context) {
      const roomImages = [roomRabbit, roomCat].map((room) => {
        const url = /^url\(["']?(.*?)["']?\)$/.exec(window.getComputedStyle(room).backgroundImage)?.[1];
        const image = new window.Image();
        if (url) image.src = url;
        return { room, image };
      });
      const controls = stage.querySelectorAll(".choice-button, #start-button, #continue-button");
      const texts = [
        "intro-question", "gift-question", "gift-ready-line", "first-thought",
        "thought-line", "anniversary-title",
      ].map((id) => elements[id]);
      const waves = stage.querySelector(".flight-waves");
      const waxSeal = envelope.querySelector(".wax-seal");
      const stamp = elements["letter-stamp"].querySelector("img");
      let letterArt;
      let paintedStamp;

      function visible(node) {
        return node && !node.closest("[hidden]");
      }

      function drawBox(node, fill) {
        const { left, top, width, height } = node.getBoundingClientRect();
        if (fill && fill !== "rgba(0, 0, 0, 0)" && fill !== "transparent") {
          context.fillStyle = fill;
          context.fillRect(left, top, width, height);
        }
      }

      function drawImage(image, fit, bounds = image?.getBoundingClientRect(), alignBottom = false) {
        if (!image?.complete || !image.naturalWidth || !bounds?.width || !bounds.height) return;
        const { left, top, width, height } = bounds;
        let drawWidth = width;
        let drawHeight = height;
        if (fit !== "fill") {
          const scale = (fit === "cover" ? Math.max : Math.min)(
            width / image.naturalWidth, height / image.naturalHeight
          );
          drawWidth = image.naturalWidth * scale;
          drawHeight = image.naturalHeight * scale;
        }
        const y = top + (height - drawHeight) * (alignBottom ? 1 : 0.5);
        context.drawImage(image, left + (width - drawWidth) / 2, y, drawWidth, drawHeight);
      }

      function drawLayer(layer) {
        if (!visible(layer)) return;
        for (const image of layer.querySelectorAll(":scope > img")) {
          if (!visible(image)) continue;
          const style = window.getComputedStyle(image);
          context.globalAlpha = Number(style.opacity);
          context.imageSmoothingEnabled = style.imageRendering !== "pixelated";
          const alignBottom = /(?:100%|bottom)$/.test(style.objectPosition);
          drawImage(image, style.objectFit, image.getBoundingClientRect(), alignBottom);
        }
        context.globalAlpha = 1;
        context.imageSmoothingEnabled = true;
      }

      function drawWaves(timestamp) {
        if (!visible(waves)) return;
        const { left, top, width, height } = waves.getBoundingClientRect();
        const phase = reducedMotion.matches ? 0 : timestamp / 1000;
        for (const [offset, speed, fill] of [[0.22, 1.2, "#258EC7"], [0.48, -1.6, "#185A8C"]]) {
          context.beginPath();
          for (let i = 0; i <= 48; i += 1) {
            const x = left + width * i / 48;
            const y = top + height * (offset + 0.10 * Math.sin(i * 0.4 + phase * speed));
            if (i === 0) context.moveTo(x, y);
            else context.lineTo(x, y);
          }
          context.lineTo(left + width, top + height);
          context.lineTo(left, top + height);
          context.closePath();
          context.fillStyle = fill;
          context.fill();
        }
      }

      function drawText(node, button = false) {
        if (!visible(node)) return;
        const style = window.getComputedStyle(node);
        const { left, top, width, height } = node.getBoundingClientRect();
        if (width <= 0 || height <= 0) return;
        const padding = parseFloat(style.paddingLeft) || 0;
        const lineHeight = parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.35;
        context.font = style.fontWeight + " " + style.fontSize + " " + style.fontFamily;
        const lines = wrapText(context, node.textContent.trim(), Math.max(1, width - 2 * padding));
        context.globalAlpha = Number(style.opacity);
        drawBox(node, style.backgroundColor);
        context.fillStyle = style.color;
        context.textAlign = "center";
        context.textBaseline = "middle";
        const y = top + (button
          ? Math.max(0, (height - lines.length * lineHeight) / 2)
          : parseFloat(style.paddingTop) || 0);
        lines.forEach((line, index) => context.fillText(line, left + width / 2, y + (index + 0.5) * lineHeight));
        context.globalAlpha = 1;
      }

      function drawEnvelope() {
        if (!visible(envelope)) return;
        const { left, top, width, height } = envelope.getBoundingClientRect();
        drawBox(envelope, "#EEC9C3");
        context.beginPath();
        context.moveTo(left, top);
        context.lineTo(left + width, top);
        context.lineTo(left + width / 2, top + height * (envelope.classList.contains("is-opening") ? 0.2 : 0.59));
        context.closePath();
        context.fillStyle = "#F7DCD2";
        context.fill();
        const seal = waxSeal.getBoundingClientRect();
        context.beginPath();
        context.arc(seal.left + seal.width / 2, seal.top + seal.height / 2, seal.width / 2, 0, 2 * Math.PI);
        context.fillStyle = "#A32D4E";
        context.fill();
        drawText(waxSeal);
      }

      function drawOpenLetter() {
        const loadedStamp = stamp?.complete && stamp.naturalWidth ? stamp : null;
        if (!letterArt || loadedStamp !== paintedStamp) {
          paintedStamp = loadedStamp;
          letterArt = makeLetterArt(loadedStamp);
        }
        const { left, top, width, height } = letter.getBoundingClientRect();
        context.save();
        context.beginPath();
        context.rect(left, top, width, height);
        context.clip();
        drawBox(letter, "#FFF4E3");
        context.drawImage(letterArt, left, top - letter.scrollTop, width, letterArt.height * width / letterArt.width);
        context.restore();
      }

      return (timestamp) => {
        const { left, top, width, height } = stage.getBoundingClientRect();
        if (width <= 0 || height <= 0) return;
        const { width: canvasWidth, height: canvasHeight } = context.canvas;
        const scale = Math.min(canvasWidth / width, canvasHeight / height);
        context.fillStyle = "#21192D";
        context.fillRect(0, 0, canvasWidth, canvasHeight);
        context.save();
        try {
          context.translate((canvasWidth - width * scale) / 2, (canvasHeight - height * scale) / 2);
          context.scale(scale, scale);
          context.translate(-left, -top);
          context.beginPath();
          context.rect(left, top, width, height);
          context.clip();
          const background = window.getComputedStyle(stage).backgroundColor;
          drawBox(stage, background === "rgba(0, 0, 0, 0)" ? "#2B2135" : background);
          for (const { room, image } of roomImages) {
            if (!visible(room)) continue;
            context.save();
            const { left: x, top: y, width: w, height: h } = room.getBoundingClientRect();
            context.beginPath();
            context.rect(x, y, w, h);
            context.clip();
            context.filter = window.getComputedStyle(room).filter;
            drawImage(image, "cover", room.getBoundingClientRect());
            context.restore();
          }
          for (const layer of [plane, cat, door, rabbit, giftLayer]) drawLayer(layer);
          drawWaves(timestamp);

          if (state.scene === "letter") drawOpenLetter();
          else {
            const panel = panels.get(state.scene);
            if (panel?.classList.contains("dialogue")) drawBox(panel, "#2B2135");
            for (const node of texts) drawText(node);
            for (const button of controls) drawText(button, true);
            drawEnvelope();
          }
          if (visible(fog)) {
            context.globalAlpha = Number(window.getComputedStyle(fog).opacity);
            drawBox(fog, "#F2F0F8");
            context.globalAlpha = 1;
          }
        } finally {
          context.restore();
        }
      };
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
    window.addEventListener("pagehide", discardRecording);

    hideImageOnError(rabbit.querySelector("img"));
    setScene("start");
    soundToggle.hidden = false;
    syncSound();
    updateVideoControls();
    void playMusic();
  }

  init();
})();
