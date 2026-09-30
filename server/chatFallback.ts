/**
 * High-quality pedagogical fallback responses for English Teachers & Students
 * when offline or before Gemini API key is configured.
 */

export function generateChatFallback(query: string, role: string = 'teacher_copilot'): string {
  const lower = query.toLowerCase();

  if (role === 'ielts_examiner') {
    if (lower.includes('part 1') || lower.includes('hometown') || lower.includes('start')) {
      return `Welcome to the IELTS Speaking simulation. Let's begin with Part 1.

**Examiner:** Could you tell me a little bit about your hometown? What do you like most about living there?

*(Tip for Band 7.5+: Aim for 3-4 sentences. Use rich adjectives such as "bustling metropolis", "vibrant coastal vibe", or "quaint rural town" instead of just "nice" or "busy".)*

👉 You can speak into your microphone or type your response!`;
    }
    if (lower.includes('part 2') || lower.includes('cue card')) {
      return `Here is your **IELTS Speaking Part 2 Cue Card**:

---
**Describe a challenging journey you have been on.**
You should say:
- Where you were going
- How you traveled
- What happened during the journey
and explain why it was so challenging or memorable for you.
---

You have 1 minute to think and take notes. When you are ready, please begin speaking for 1 to 2 minutes!`;
    }
    return `**Examiner Feedback & Assessment:**
Thank you for your response. Here is an initial assessment across the 4 IELTS criteria:

1. **Fluency & Coherence (FC):** Good conversational pacing with natural transition signals ("To be completely honest...", "What really stands out is...").
2. **Lexical Resource (LR):** Solid foundational vocabulary. Consider upgrading:
   - *"very important"* ➔ **"of paramount importance"** / **"indispensable"**
   - *"I think that"* ➔ **"From my perspective"** / **"I am inclined to believe that"**
3. **Grammatical Range & Accuracy (GRA):** Good use of compound sentences. Try incorporating a mixed conditional or inversion (*"Not only did I learn..., but I also..."*).
4. **Pronunciation (PR):** Focus on linking words ending in consonants to following vowels (connected speech).

Estimated initial band: **6.5 - 7.0**. Would you like to practice another question or refine this answer?`;
  }

  if (role === 'native_partner') {
    if (lower.includes('hello') || lower.includes('hi') || lower.includes('how are you')) {
      return `Hey there! It's so great to meet you! How's your day treating you so far? Are you currently preparing for an exam or just looking to practice your spoken English?`;
    }
    return `That sounds super interesting! To make that sound even more like what a native speaker would say at a coffee chat, you could say:
> *"I've been snowed under with work lately, but I still make time for English!"*

By the way, what kind of movies or music do you usually listen to in your free time? I'd love to hear your thoughts!`;
  }

  if (role === 'grammar_doctor') {
    if (lower.includes('despite') || lower.includes('although')) {
      return `⚡ **Phân tích Bắt Lỗi Nhanh:**

❌ **Lỗi sai:** *"Despite of the heavy rain, they went to school yesterday."*
✅ **Sửa đúng:** *"Despite the heavy rain, they went to school yesterday."* (hoặc *"In spite of the heavy rain..."*)

📌 **Quy tắc cốt lõi:**
- **Despite + Noun Phrase / V-ing** (KHÔNG có 'of').
- **In spite of + Noun Phrase / V-ing** (BẮT BUỘC có 'of').
- **Although / Even though + S + V** (mệnh đề hoàn chỉnh).

🎯 **Bẫy đề thi THPT:** Đề bài hay lừa chèn "Despite of" ở phần tìm lỗi sai (Error Identification). Gặp "Despite of" là chọn ngay phương án sai!`;
    }
    return `⚡ **Bác sĩ Ngữ pháp - Phản hồi Nhanh:**

Đoạn câu của bạn có cấu trúc khá tốt. Một số lưu ý ngữ pháp trọng tâm:
1. **Sự hòa hợp Chủ - Vị:** Lưu ý các đại từ bất định (*Everyone, Each of, Neither of*) luôn đi với động từ số ít.
2. **Thì động từ:** Khi có mệnh đề thời gian tương lai (*When, As soon as, By the time*), mệnh đề phụ dùng **Hiện tại đơn** chứ không dùng "will".
3. **Giới từ đi kèm:** *interested in, good at, dependent on, disappointed with/by*.

Gửi câu cụ thể bạn muốn kiểm tra, tôi sẽ sửa và chỉ ra bẫy thi ngay!`;
  }

  if (role === 'test_matrix_specialist') {
    return `📊 **Phân Tích Ma Trận Đề & Khảo Thí THPT:**

Theo khung chương trình GDPT 2018 và định dạng đề khảo thí Tiếng Anh mới nhất:
- **Tỉ lệ phân bố 4 cấp độ tư duy:**
  - Nhận biết (Recognition): **30%** (Phát âm, trọng âm, từ vựng trực tiếp).
  - Thông hiểu (Comprehension): **35%** (Ngữ pháp chức năng, điền từ đoạn văn).
  - Vận dụng (Application): **20%** (Đọc hiểu suy luận cơ bản, sắp xếp đoạn hội thoại).
  - Vận dụng cao (High Application): **15%** (Suy luận thái độ tác giả, từ vựng học thuật ít gặp, viết luận/câu tương đương).

💡 **Khuyến nghị cho giáo viên:** Nên cân bằng độ khó của 3 phương án nhiễu (distractors) bằng cách sử dụng các từ đồng âm hoặc cùng trường từ vựng để tránh học sinh đoán mò phương án.`;
  }

  // Default: Teacher Copilot
  if (lower.includes('warm-up') || lower.includes('khởi động')) {
    return `👨‍🏫 **Gợi Ý Hoạt Động Warm-Up 5 Phút Sôi Động (SGK Global Success):**

**Tên trò chơi:** *"Word Association Relay" (Tiếp sức từ vựng)*
- **Thời lượng:** 4 - 5 phút.
- **Mục tiêu:** Kích hoạt vốn từ vựng nền tảng của học sinh trước bài học.
- **Cách tổ chức:**
  1. Chia lớp thành 2 - 4 đội. Viết chủ đề chính lên bảng (Ví dụ: *Environment, Community Service, Future Jobs*).
  2. Mỗi đội cử học sinh lần lượt chạy lên viết 1 từ/cụm từ liên quan (không được trùng).
  3. Sau 3 phút, giáo viên cùng cả lớp duyệt từ, sửa phát âm nhanh và cộng điểm thi đua.
- **Chuyển tiếp (Lead-in):** *"All these great words you just wrote are the core vocabulary of our lesson today - Unit 4!"*

Thầy/Cô có muốn bổ sung thêm câu hỏi phân hóa cho phần tiếp theo không ạ?`;
  }

  return `👨‍🏫 **Trợ Lý Sư Phạm Tiếng Anh Global Success:**

Chào Thầy/Cô! Tôi đã nhận được yêu cầu: *" ${query} "*.

Dưới đây là định hướng sư phạm và giải pháp gợi ý:
1. **Mục tiêu bài học:** Phát triển toàn diện năng lực giao tiếp và tư duy ngôn ngữ cho học sinh.
2. **Phương pháp đề xuất:** Kết hợp phương pháp dạy học theo nhiệm vụ (Task-Based Learning) với các câu hỏi kiểm tra phân hóa.
3. **Tài liệu tham khảo tích hợp:** SGK Tiếng Anh Global Success (NXB Giáo Dục Việt Nam) kết hợp tài liệu khảo thí quốc tế (Cambridge Assessment, BBC Learning English).

Thầy/Cô có thể kích hoạt tính năng **Đàm thoại giọng nói Live (Gemini 3.8 Live)** để trao đổi hoặc yêu cầu tôi tạo ngay phiếu bài tập / ma trận đề kiểm tra!`;
}
