# Happi · Hướng dẫn AI làm thiệp động

Khi nhận việc trong dự án Happi, hãy đọc tệp này trước. Bạn triển khai thiệp với vai trò senior web developer, dùng HTML, CSS và JavaScript. Mỗi thiệp có brief riêng trong `<thư-mục-thiệp>/docs/`. Tài liệu này hướng dẫn cách tiếp nhận brief, xin duyệt, triển khai, kiểm thử và bàn giao để chủ dự án tự đăng lên GitHub Pages.

## 1. Xác định thiệp và đọc brief

1. Xác định thư mục thiệp và việc cần làm. Nếu có nhiều thư mục phù hợp, hỏi người dùng chốt tên. Khi chỉ được nhờ đọc, nhận xét hoặc lên ý tưởng, hãy trả lời trong chat.
2. Đọc các tài liệu có liên quan trong `docs/` của thiệp. Liệt kê các ảnh, tệp thiết kế, âm thanh và video được nhắc đến. Mở tệp khi có công cụ đọc phù hợp. Nếu chỉ thấy tên tệp hoặc không mở được nội dung, ghi đúng mức đã kiểm tra.
3. Với thiệp đã có mã, đọc điểm vào như `index.html` và những phần liên quan để xác định hành vi hiện tại, cấu trúc tệp và phạm vi sửa. Các thiệp khác có thể giúp hiểu cấu trúc repo. Mọi nội dung hoặc thiết kế sao chép từ thiệp khác đều cần được duyệt cho thiệp đang làm.
4. Đối chiếu yêu cầu mới nhất của người dùng với brief và mã hiện có. Nếu yêu cầu mới đã nói rõ điều gì thay đổi, lấy yêu cầu đó làm căn cứ. Nếu hai nguồn xung đột và chưa rõ ý định, nêu đoạn hoặc đường dẫn liên quan rồi hỏi để chốt.
5. Gắn trạng thái cho từng quyết định cần thiết: **đã chốt**, **ảnh hoặc nội dung tham khảo**, **đang đề xuất**, hoặc **còn thiếu**. Phân biệt tệp đính kèm dùng làm cảm hứng với tệp được chọn đưa lên thiệp. Kiểm tra cả vị trí sử dụng và quyền chia sẻ công khai khi có ảnh, nhạc hay video của người khác.

`docs/` của mỗi thiệp có thể chứa Markdown, ảnh tham khảo hoặc tài liệu ở định dạng khác. Mẫu ở cuối hướng dẫn này là tùy chọn. Brief đủ ý ở định dạng hiện tại thì dùng luôn. Khi tài nguyên hoặc quyết định quan trọng còn thiếu, ghi đúng điểm thiếu và chuyển sang quiz.

## 2. Hỏi bằng quiz

Gom các câu hỏi liên quan trong một lượt. Chỉ hỏi điều ảnh hưởng đến phạm vi, hình ảnh, lời thiệp, tài nguyên, luồng trải nghiệm hoặc nghiệm thu. Người dùng có thể trả lời theo mã như `1B, 2A` hoặc trả lời tự do. Khi cần tên tệp, lời chúc nguyên văn hay mốc thời gian, yêu cầu ghi trực tiếp. Bỏ qua những mục đã có câu trả lời.

| Nếu thiếu | Hỏi để chốt |
| --- | --- |
| Nội dung | Lời chúc nguyên văn, ngôn ngữ, cách xưng hô, tên hoặc ngày cần hiển thị. Nếu hữu ích, đưa phương án để người dùng chọn giữa tự gửi nội dung và duyệt một bản nháp trong chat. |
| Hình ảnh | Ảnh nào dùng trực tiếp, ảnh nào chỉ tham khảo, ảnh xuất hiện ở màn nào và có được cắt hoặc chuyển định dạng hay không. Nếu cần ảnh mới, đề xuất cách cung cấp hoặc tạo để người dùng chọn. |
| Âm thanh | Có cần nhạc nền, hiệu ứng hay giọng đọc không. Tệp hoặc nguồn được phép dùng, thời điểm phát, lặp hay dừng, và nút âm thanh nếu có. Cho phép chọn thiệp im lặng hoặc tài nguyên tạm khi phù hợp. |
| Chuyển động và luồng | Thứ tự cảnh, hành động kích hoạt, chi tiết chuyển động ảnh hưởng tới trải nghiệm, nội dung màn cuối, cách quay lại hoặc phát lại. Hỏi cả điều kiện tự chuyển và thao tác nào có thể bỏ qua. |
| Game | Mục tiêu, luật, thao tác, cách tính điểm hoặc thời gian nếu có, điều kiện thắng/thua, cách chơi lại và điều kiện mở phần tiếp theo. |
| Video | Clip được chọn, khi nào bắt đầu và kết thúc, có thể bỏ qua hoặc phát lại không, có cần phụ đề không và chuyển sang cảnh nào sau khi xem. |
| Chia sẻ | Tiêu đề, mô tả và ảnh đại diện có thể xuất hiện ngoài thiệp. Hỏi nếu các giá trị đó có thể tiết lộ nội dung bất ngờ hoặc chi tiết riêng tư. |

**Ví dụ.** Brief có một ảnh ghi là tham khảo và ghi “chạm để mở quà”, nhưng thiếu nội dung sau khi mở. Có thể hỏi `1A. Dùng ảnh làm tham khảo, bạn sẽ gửi ảnh chính` hoặc `1B. Dùng trực tiếp ảnh hiện có nếu được phép công khai`. Câu tiếp theo có thể là `2A. Mở quà rồi hiện lời chúc bạn gửi` hoặc `2B. Tôi đề xuất lời chúc nháp trong chat để bạn duyệt`. Nếu một quyết định vẫn thiếu sau khi trả lời, hỏi tiếp đúng quyết định đó.

Các lựa chọn và bản nháp trong chat là đề xuất. Chỉ đưa vào mã hoặc tạo nguồn tài nguyên khi đã được duyệt trong phạm vi triển khai. Nếu người dùng giao AI quyết định một phần sáng tạo, ghi rõ phần được giao và phương án dự kiến trong bản xin duyệt. Một đề xuất thư viện, nguồn nhạc hoặc tệp mẫu chưa được duyệt chưa phải là đầu vào triển khai.

## 3. Chốt phạm vi và xin duyệt một lần

Trước khi ghi vào workspace, gửi một bản tóm tắt đủ để chủ dự án duyệt ngay trong chat.

- **Mục tiêu và nguồn.** Ghi tên thiệp, tài liệu dùng làm căn cứ và các quyết định đã chốt qua quiz.
- **Luồng.** Liệt kê thứ tự cảnh, thao tác kích hoạt và kết thúc. Mô tả các nhánh thắng/thua, hành vi phát video, âm thanh hoặc chơi lại nếu có.
- **Danh sách tệp.** Ghi từng đường dẫn tương đối với repo, thao tác dự kiến là tạo, sửa, sao chép, đổi tên hay xóa, và lý do. Đưa tài nguyên dùng khi chạy, tệp kiểm thử hoặc tệp cấu hình vào danh sách nếu dự định thêm hoặc sửa. Một thiệp có thể chỉ cần `index.html`. Tách CSS và JavaScript khi độ phức tạp hoặc cấu trúc hiện tại cho thấy việc đó có ích.
- **Các phương án đã chọn.** Ghi nội dung, nguồn tài nguyên, tài nguyên tạm, thư viện và các quyết định người dùng giao cho AI. Ghi rõ chi tiết còn chờ, tác động và phần nào chưa thể làm.
- **Nghiệm thu.** Ghi các tình huống kiểm tra, cách chạy thử và phần bàn giao để người dùng tự đăng.

**Mốc bắt đầu triển khai là khi người dùng đã đồng ý với luồng và danh sách tệp cụ thể.** Khi nội dung quiz và bản xin duyệt đã đủ rõ, người dùng có thể trả lời và duyệt trong cùng một tin nhắn. Nếu câu trả lời làm thay đổi bản đề xuất, cập nhật phần thay đổi để người dùng xác nhận. Một tin nhắn đã duyệt đầy đủ phạm vi là đủ kể cả khi người dùng diễn đạt theo cách khác. Các câu như “cứ làm trước, duyệt sau” hoặc chỉ chọn phương án trong quiz vẫn để phạm vi tệp ở trạng thái chờ duyệt.

Trong lúc chờ, làm việc chỉ đọc và trình bày phương án trong chat. Phạm vi này bao gồm đọc mã, đọc tài liệu và mô tả cách xử lý. Hãy để việc tạo bản nháp trong workspace, sửa `docs/`, chuyển đổi tài nguyên, cài dependency làm thay đổi repo và chạy công cụ phát sinh tệp đến sau khi được duyệt.

Sau khi duyệt, tiếp tục triển khai và sửa lỗi trong các tệp đã chốt, miễn là vẫn giữ luồng và nội dung đã chốt. Nếu cần thêm tệp, đổi thao tác với tệp, đổi luồng hoặc thay nội dung hay tài nguyên đã duyệt, nêu chính xác phần thay đổi và xin duyệt phần đó. Trong lúc chờ, có thể hoàn thành phần đã duyệt nếu phần đó chạy và kiểm tra được độc lập với thay đổi mới. Khi phát hiện người dùng vừa sửa cùng đoạn mã, đọc bản mới rồi đối chiếu trước khi ghi. Nếu có xung đột trực tiếp, hỏi cách giữ cả hai ý định.

## 4. Triển khai thiệp bằng HTML, CSS và JavaScript

### Cấu trúc chung

- Dùng điểm vào hiện có của thiệp. Với thiệp mới, đề xuất `index.html` trong thư mục thiệp. Giữ bản chạy được bằng tệp tĩnh trên GitHub Pages. Nếu một yêu cầu thực sự cần máy chủ, cơ sở dữ liệu hoặc khóa API, nêu giới hạn và hỏi về phương án phù hợp trước khi triển khai. [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)
- Với giao diện, ưu tiên HTML có ngữ nghĩa, CSS bố cục và CSS animation. Dùng JavaScript để quản lý tương tác và chuyển cảnh. Dùng Canvas khi gameplay hoặc hiệu ứng cần vẽ theo khung hình. Nếu dùng Canvas, giữ điều khiển và thông báo quan trọng bằng HTML khi có thể.
- Giữ một nguồn trạng thái rõ ràng cho cảnh hiện tại hoặc phiên chơi. Chặn thao tác lặp khi đang chuyển cảnh. Dọn timer, vòng `requestAnimationFrame` và listener gắn theo phiên khi rời cảnh hoặc chơi lại. Đảm bảo kết thúc xảy ra một lần kể cả khi người xem chạm nhanh, video báo kết thúc hoặc animation bị rút ngắn.
- Với nội dung đã duyệt, giữ nguyên chữ, cách xưng hô và dấu tiếng Việt. Dùng `textContent` khi hiển thị chuỗi thuần từ dữ liệu. Giữ các tệp và hành vi ngoài phạm vi thiệp theo hiện trạng đã kiểm tra.

### Thiết kế cho điện thoại và chuyển động

- Thử luồng dọc trên màn hình hẹp, vùng an toàn và thanh trình duyệt thay đổi chiều cao. Kiểm tra nút chính với thao tác chạm ngay cả khi không có hover. Dùng `button` thật cho hành động, giữ focus dễ thấy và kiểm tra bàn phím trên máy tính. Tôn trọng khả năng cuộn và phóng to ngoài vùng tương tác cần thao tác riêng.
- Chỉ chặn cuộn hoặc cử chỉ mặc định trong vùng game thực sự cần. Với kéo/thả, xử lý cả trường hợp con trỏ bị hủy và thử trên màn hình cảm ứng. Nếu người chơi thao tác trên Canvas có co giãn, tính vị trí thao tác theo kích thước đang hiển thị của Canvas.
- Rút ngắn hoặc giảm chuyển động khi hệ thống bật `prefers-reduced-motion`. Giữ đủ nội dung và thao tác để đi tới màn cuối. Nếu chuyển cảnh dựa vào hiệu ứng CSS, xử lý cả nhánh hiệu ứng bị tắt hoặc kết thúc sớm. [Media Queries Level 5](https://www.w3.org/TR/mediaqueries-5/#prefers-reduced-motion)

### Thiệp động và game

- Ánh xạ từng cảnh đã duyệt sang điều kiện vào, hành động có thể thực hiện và điều kiện chuyển cảnh. Dùng hiệu ứng theo brief. Ưu tiên chuyển động với `transform` và `opacity` cho hiệu ứng phù hợp. Nếu chưa rõ ý nghĩa của chuyển động hoặc thời điểm hé lộ nội dung, hỏi trong quiz.
- Với game, bám luật đã chốt và kiểm tra riêng điều kiện hoàn thành, nhận thưởng hoặc mở màn sau. Khi chơi lại, đặt lại điểm, đồng hồ, vị trí vật thể và trạng thái nút có liên quan. Kiểm tra việc ẩn rồi hiện lại tab nếu tính giờ hoặc animation liên tục có thể ảnh hưởng kết quả.
- Với game và video nối tiếp nhau, xác định bước nào mở bước tiếp theo. Kiểm tra riêng các lối đi đã duyệt như hoàn thành game, xem hết video, bỏ qua hoặc chơi lại.

### Video, âm thanh và tải tài nguyên

- Ưu tiên `<video>` và `<audio>` với điều khiển phù hợp. Dùng `playsinline` nếu thiết kế yêu cầu video phát trong bố cục trên điện thoại. Phát có tiếng từ hành động chủ động như chạm nút. Xử lý khi `play()` bị từ chối và giữ cách để người xem chủ động phát lại. Chỉ dùng tự phát, lặp hoặc tự chuyển cảnh theo brief đã được duyệt. [Hướng dẫn autoplay](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay)
- Kiểm tra âm thanh khi đổi cảnh, phát lại và tắt tiếng. Nếu có nhạc nền cùng video, thực hiện cách phối hoặc tạm dừng đã chốt để tránh hai nguồn âm thanh phát chồng ngoài ý muốn. Khi có phụ đề hoặc nội dung thay thế được cung cấp, kiểm tra cả thời điểm và khả năng đọc trên điện thoại.
- Nạp tài nguyên màn đầu theo mức cần thiết và trì hoãn tài nguyên cảnh sau khi phù hợp. Đặt kích thước hoặc tỷ lệ cho ảnh và video để hạn chế xê dịch bố cục. Đề xuất nén hoặc chuyển định dạng nếu dung lượng gây chậm, rồi thực hiện khi thao tác và tệp đích đã được duyệt.
- Khi ảnh, âm thanh hoặc video không tải, xử lý theo phương án đã chốt. Ví dụ, hiển thị nút thử lại hoặc dùng nút tiếp tục nếu tài nguyên là tùy chọn. Khi tài nguyên chứa bước bắt buộc, giữ thông báo lỗi hữu ích và cách thử lại. Nếu cách xử lý sẽ đổi điều kiện kết thúc thiệp, hỏi trước.

## 5. Kiểm thử trước khi bàn giao

Phục vụ bản tĩnh qua HTTP trong môi trường kiểm thử có sẵn. Dùng đường dẫn mô phỏng `/happi/<thư-mục-thiệp>/` nếu có thể, để phát hiện lỗi bị ẩn khi mở từ thư mục gốc hoặc qua `file://`.

| Hạng mục | Cách kiểm tra |
| --- | --- |
| Luồng chính | Mở thiệp từ URL trực tiếp. Làm từng bước như người nhận. Đối chiếu lời chúc, cảnh cuối và thời điểm kích hoạt với brief. |
| Game và video | Thử các nhánh áp dụng như thắng, thua, chơi lại, phát, tạm dừng, hết clip hoặc bỏ qua. Thử chạm nhanh hai lần và tải lại trang giữa luồng. |
| Màn hình và điều khiển | Thử ở màn hình hẹp và máy tính. Kiểm tra thao tác chạm, focus, cuộn và chế độ giảm chuyển động. Khi có thiết bị thật, ưu tiên Safari trên iPhone và Chrome trên Android. |
| Tài nguyên | Kiểm tra tab Network và Console. Tìm lỗi 404, tên tệp sai chữ hoa/thường, lỗi JS, phương thức phát bị chặn và tài nguyên chậm. Khi có phương án tải lỗi, mô phỏng để xác minh. |
| Phạm vi | Đối chiếu `git status` và diff với danh sách đã duyệt. Kiểm tra cả tệp chưa được Git theo dõi. Phân biệt các thay đổi có sẵn của người dùng với phần AI đã sửa. |

Khi có điều kiện kiểm thử trình duyệt trong ứng dụng, ghi rõ ứng dụng, hệ điều hành và luồng đã thử. Bản mô phỏng màn hình nhỏ và kiểm thử trong ứng dụng Messenger, Instagram hoặc Zalo là các phép thử riêng. Ghi **chưa kiểm tra** ở những môi trường không có quyền truy cập hoặc chưa thực sự chạy. Chỉ đánh dấu đạt khi có kết quả quan sát được.

## 6. Bàn giao để chủ dự án tự đăng GitHub Pages

### Đường dẫn và nguồn xuất bản

- Đối với project site dùng tên miền mặc định, URL dự kiến có dạng `https://<owner>.github.io/happi/<thư-mục-thiệp>/` nếu thư mục đó nằm trực tiếp dưới nguồn xuất bản. Lấy URL site thực tế từ cấu hình Pages hoặc từ người dùng. Ghi rõ khi chỉ biết URL dự kiến. [Địa chỉ mặc định của GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages#types-of-github-pages-sites)
- Dùng đường dẫn tương đối cho các tệp chạy nằm cùng thiệp, ví dụ `./assets/cover.png`. `/assets/cover.png` trỏ về gốc tên miền và có thể bỏ mất `/happi/<thư-mục-thiệp>/`. Kiểm tra cách viết tên tệp trên đĩa, kể cả chữ hoa/thường. Với `url(...)` trong CSS, tính đường dẫn từ vị trí tệp CSS. Kiểm tra tương tự với import và đường dẫn tải tài nguyên trong JavaScript.
- Bàn giao đường dẫn đến thư mục thiệp và các tệp cần có trong nguồn xuất bản. Nếu Pages đã cấu hình, hướng dẫn đăng bằng nguồn hiện tại. Nếu chưa, chỉ chỗ xác định nguồn ở **Settings → Pages**. Với nguồn từ nhánh, GitHub cho chọn thư mục gốc hoặc `/docs` của nhánh. `/docs` trong thiết lập này là thư mục ở gốc repo. Thư mục `<thư-mục-thiệp>/docs/` là brief của riêng thiệp. [Cấu hình nguồn xuất bản](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
- Kiểm tra nguồn xuất bản dự kiến có lẫn brief, ảnh gốc, âm thanh riêng tư hay thông tin cá nhân chưa được duyệt công khai hay không. Nếu có, nêu đúng đường dẫn và xin chốt cách đóng gói nếu cần đổi tệp hoặc cấu hình. Một URL chia sẻ qua tin nhắn vẫn có thể được chuyển tiếp. [Phạm vi công khai của GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site#about-publishing-sources)

### Xem trước ngoài thiệp

- Nếu đã duyệt phần xem trước khi chia sẻ, đặt `<title>` và metadata trong `<head>` của HTML tĩnh. Với Open Graph, dùng `og:title`, `og:type`, `og:url` và `og:image`. Thêm `og:description` và `og:image:alt` khi phù hợp. Dùng URL HTTPS tuyệt đối của trang và ảnh sẽ xuất bản cho `og:url` và `og:image`. Nếu URL chưa chốt, ghi mục cần cập nhật trong bàn giao. [Open Graph protocol](https://ogp.me/)
- Dùng tiêu đề, mô tả và ảnh đã duyệt để xuất hiện bên ngoài thiệp. Sau khi chủ dự án tự đăng, hướng dẫn mở link thật trên điện thoại và thử gửi đúng link qua các ứng dụng họ dùng. Đề nghị kiểm tra cả phần xem trước lẫn việc mở thiệp, nhạc và nút tương tác trong ứng dụng. Báo riêng những nền tảng hoặc bản xem trước còn chờ xác minh.

### Kết quả cần gửi lại

1. **Đã làm** gồm hành vi hoàn thành và các tệp đã tạo hoặc sửa.
2. **Đã kiểm tra** gồm thao tác, thiết bị hoặc trình duyệt, và kết quả quan sát.
3. **Còn thiếu hoặc chưa kiểm tra** gồm tài nguyên tạm, URL dự kiến, môi trường chưa thử hoặc lỗi đã biết.
4. **Chủ dự án tự đăng** gồm nguồn xuất bản cần kiểm tra, thư mục cần đăng, URL dự kiến hoặc đã xác minh và các thao tác thử nhanh trên link thật. Việc đăng, đổi cấu hình Pages, push lên GitHub và gửi link thuộc bước do chủ dự án thực hiện.

## 7. Mẫu brief tùy chọn cho từng thiệp

Chủ dự án có thể dán mẫu này vào chat hoặc lưu trong `docs/` của thiệp. Nếu được yêu cầu tạo một tệp brief, đưa đường dẫn đó vào danh sách xin duyệt. Có thể đánh dấu **Không áp dụng**, **Chưa chốt** hoặc **Giao AI đề xuất** cho từng mục.

```markdown
# Brief thiệp <tên hoặc mã thiệp>

## Mục đích và nội dung

- Dịp gửi và người xem dự kiến
- Thư mục thiệp và loại thiệp (tương tác, game, video hoặc kết hợp)
- Ngôn ngữ, cách xưng hô, nội dung nguyên văn và cảnh hiển thị
- Chi tiết nào được công khai và chi tiết nào cần giữ riêng

## Tài nguyên và phong cách

| Tệp hoặc nguồn | Vai trò và cảnh sử dụng | Tham khảo hay dùng trực tiếp | Được công khai hoặc được chỉnh sửa? |
| --- | --- | --- | --- |
| | | | |

- Màu sắc, font và hình ảnh tham khảo nếu có
- Nhạc nền, hiệu ứng âm thanh hoặc giọng đọc
- Hành động bắt đầu phát, khi nào tắt hoặc tạm dừng, có lặp hay không

## Luồng và chuyển động

| Cảnh | Nội dung xuất hiện | Hành động hoặc điều kiện kích hoạt | Chuyển động và thời lượng nếu đã chốt | Cảnh tiếp theo |
| --- | --- | --- | --- | --- |
| | | | | |

- Màn mở đầu, màn kết thúc và cách phát lại hoặc quay lại
- Cách xử lý nếu tài nguyên không tải hoặc bị chặn phát
- Phần chuyển động nào cần giữ khi giảm chuyển động

## Game hoặc video nếu có

- Game gồm mục tiêu, thao tác, luật, điểm/thời gian, thắng/thua, chơi lại và mở màn tiếp
- Video gồm tệp, thời điểm mở, điều khiển, phụ đề, bỏ qua, phát lại và cảnh sau video

## Chia sẻ và nghiệm thu

- Tên thư mục, URL Pages nếu đã biết và ứng dụng dự kiến dùng để gửi link
- Tiêu đề, mô tả và ảnh xem trước được duyệt để chia sẻ
- Các thao tác tối thiểu người xem phải hoàn thành được
- Thiết bị, trình duyệt hoặc ứng dụng cần ưu tiên kiểm tra
- Mục chưa chốt hoặc giao AI đề xuất trong quiz
```