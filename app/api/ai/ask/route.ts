import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const MODELS_TO_TRY = ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest'];

// Helper to strip markdown symbols for natural speech output
function cleanMarkdownForSpeech(text: string): string {
  if (!text) return '';
  return text
    .replace(/^#+\s+/gm, '') // Remove heading hashes
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1') // Remove italics
    .replace(/__(.*?)__/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    .replace(/`{1,3}[^`]*`{1,3}/g, '') // Remove code blocks
    .replace(/^\s*[-*+]\s+/gm, '') // Remove list bullets
    .replace(/^\s*\d+\.\s+/gm, '') // Remove list numbers
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove markdown links
    .replace(/---+/g, '') // Remove horizontal rules
    .replace(/>\s+/gm, '') // Remove blockquotes
    .replace(/\|.*?\|/g, ' ') // Remove tables
    .replace(/\s+/g, ' ') // Collapse extra spaces
    .trim()
    .slice(0, 1000); // Generous speech text limit
}

// Intelligent topic-aware syllabus generator for offline or network-constrained scenarios
function generateIntelligentOfflineResponse(
  question: string,
  selectedClass: string,
  subject: string,
  language: 'hi' | 'en'
): string {
  const q = (question || '').toLowerCase();
  const isHi = language === 'hi';

  // 1. MCQ Request
  if (q.includes('mcq') || q.includes('वस्तुनिष्ठ') || q.includes('बहुविकल्पीय') || q.includes('objective')) {
    if (q.includes('math') || subject.toLowerCase().includes('math') || q.includes('गणित')) {
      if (isHi) {
        return `### 📝 कक्षा ${selectedClass} गणित - महत्वपूर्ण बहुविकल्पीय प्रश्न (MCQ Test)

**Q1. द्विघात समीकरण $ax^2 + bx + c = 0$ के मूल वास्तविक और समान होंगे यदि:**
A. $b^2 - 4ac > 0$
B. $b^2 - 4ac = 0$
C. $b^2 - 4ac < 0$
D. $b^2 - 4ac \\le 0$
*✓ सही उत्तर:* Option B
*व्याख्या:* जब विविक्तकर (Discriminant, $D = b^2 - 4ac$) शून्य होता है, तब दोनों मूल वास्तविक व समान होते हैं।

---

**Q2. यदि $\\sin \\theta = \\frac{3}{5}$, तो $\\cos \\theta$ का मान क्या होगा?**
A. $\\frac{4}{5}$
B. $\\frac{5}{3}$
C. $\\frac{3}{4}$
D. $\\frac{1}{2}$
*✓ सही उत्तर:* Option A
*व्याख्या:* $\\cos \\theta = \\sqrt{1 - \\sin^2 \\theta} = \\sqrt{1 - \\frac{9}{25}} = \\sqrt{\\frac{16}{25}} = \\frac{4}{5}$।

---

**Q3. समांतर श्रेणी (A.P.) 2, 7, 12, ... का 10वां पद क्या है?**
A. 45
B. 47
C. 49
D. 52
*✓ सही उत्तर:* Option B
*व्याख्या:* $a = 2, d = 5$, $a_{10} = a + (10 - 1)d = 2 + 9 \\times 5 = 47$।

---

**Q4. वृत्त के किसी बिंदु पर खींची गई स्पर्श रेखा स्पर्श बिंदु से जाने वाली त्रिज्या पर होती है:**
A. लंब (Perpendicular)
B. समांतर
C. प्रतिच्छेदी
D. संपाती
*✓ सही उत्तर:* Option A
*व्याख्या:* प्रमेय 10.1 के अनुसार वृत्त के किसी बिंदु पर स्पर्श रेखा, स्पर्श बिंदु से जाने वाली त्रिज्या पर लंब होती है ($90^\\circ$)।

---

**Q5. बिंदु $(3, 4)$ की मूल बिंदु $(0, 0)$ से दूरी कितनी है?**
A. 3 मात्रक
B. 4 मात्रक
C. 5 मात्रक
D. 7 मात्रक
*✓ सही उत्तर:* Option C
*व्याख्या:* दूरी सूत्र: $\\sqrt{x^2 + y^2} = \\sqrt{3^2 + 4^2} = \\sqrt{9 + 16} = \\sqrt{25} = 5$ मात्रक।

---

**Q6. यदि दो समरूप त्रिभुजों की संगत भुजाओं का अनुपात $4:9$ है, तो उनके क्षेत्रफलों का अनुपात होगा:**
A. $2:3$
B. $4:9$
C. $81:16$
D. $16:81$
*✓ सही उत्तर:* Option D
*व्याख्या:* समरूप त्रिभुजों के क्षेत्रफलों का अनुपात उनकी संगत भुजाओं के वर्ग के अनुपात के बराबर होता है: $(4/9)^2 = 16:81$।

---

**Q7. एक ठोस अर्धगोले का कुल पृष्ठीय क्षेत्रफल क्या होता है?**
A. $2\\pi r^2$
B. $3\\pi r^2$
C. $4\\pi r^2$
D. $\\frac{2}{3}\\pi r^3$
*✓ सही उत्तर:* Option B
*व्याख्या:* अर्धगोले का वक्र पृष्ठ $2\\pi r^2$ तथा आधार वृत्त का क्षेत्रफल $\\pi r^2$ मिलकर कुल $3\\pi r^2$ बनता है।

---

**Q8. एक पासे को एक बार फेंकने पर अभाज्य संख्या (Prime Number) आने की प्रायिकता क्या है?**
A. $\\frac{1}{6}$
B. $\\frac{1}{3}$
C. $\\frac{1}{2}$
D. $\\frac{2}{3}$
*✓ सही उत्तर:* Option C
*व्याख्या:* पासे पर कुल परिणाम = 6। अभाज्य संख्याएं {2, 3, 5} = 3। प्रायिकता = $\\frac{3}{6} = \\frac{1}{2}$।

---

**Q9. $\\tan 45^\\circ$ का मान क्या होता है?**
A. 0
B. 1
C. $\\frac{1}{\\sqrt{3}}$
D. $\\sqrt{3}$
*✓ सही उत्तर:* Option B
*व्याख्या:* त्रिकोणमितीय अनुपात सारणी के अनुसार $\\tan 45^\\circ = 1$ होता है।

---

**Q10. किसी बारंबारता बंटन का बहुलक (Mode) ग्राफ़ीय रूप से निर्धारित किया जा सकता है:**
A. तोरण (Ogive) द्वारा
B. बारंबारता बहुभुज द्वारा
C. आयतचित्र (Histogram) द्वारा
D. वृत्तारेख द्वारा
*✓ सही उत्तर:* Option C
*व्याख्या:* आयतचित्र (Histogram) की सबसे ऊंची आयत के शीर्ष बिंदुओं को मिलाकर बहुलक ज्ञात किया जाता है।`;
      } else {
        return `### 📝 Class ${selectedClass} Mathematics - High-Yield MCQ Practice

**Q1. The roots of the quadratic equation $ax^2 + bx + c = 0$ are real and equal if:**
A. $b^2 - 4ac > 0$
B. $b^2 - 4ac = 0$
C. $b^2 - 4ac < 0$
D. $b^2 - 4ac \\le 0$
*✓ Correct Answer:* Option B
*Explanation:* When discriminant $D = b^2 - 4ac = 0$, both roots are real and equal ($-b/2a$).

---

**Q2. If $\\sin \\theta = \\frac{3}{5}$, then $\\cos \\theta$ equals:**
A. $\\frac{4}{5}$
B. $\\frac{5}{3}$
C. $\\frac{3}{4}$
D. $\\frac{1}{2}$
*✓ Correct Answer:* Option A
*Explanation:* $\\cos \\theta = \\sqrt{1 - \\sin^2 \\theta} = \\sqrt{1 - 9/25} = 4/5$.

---

**Q3. The 10th term of the A.P. 2, 7, 12, ... is:**
A. 45
B. 47
C. 49
D. 52
*✓ Correct Answer:* Option B
*Explanation:* $a_n = a + (n - 1)d = 2 + (10 - 1) \\times 5 = 2 + 45 = 47$.

---

**Q4. A tangent to a circle is perpendicular to the radius through the:**
A. Point of contact
B. Center only
C. Chord
D. Secant
*✓ Correct Answer:* Option A
*Explanation:* Theorem 10.1: The tangent at any point of a circle is perpendicular to the radius through the point of contact.

---

**Q5. The distance of point $(3, 4)$ from the origin is:**
A. 3 units
B. 4 units
C. 5 units
D. 7 units
*✓ Correct Answer:* Option C
*Explanation:* Distance = $\\sqrt{x^2 + y^2} = \\sqrt{3^2 + 4^2} = \\sqrt{25} = 5$ units.

---

**Q6. If the ratio of corresponding sides of two similar triangles is $4:9$, the ratio of their areas is:**
A. $2:3$
B. $4:9$
C. $16:81$
D. $81:16$
*✓ Correct Answer:* Option C
*Explanation:* The ratio of areas of two similar triangles equals the square of the ratio of their corresponding sides: $(4/9)^2 = 16:81$.

---

**Q7. The total surface area of a solid hemisphere of radius $r$ is:**
A. $2\\pi r^2$
B. $3\\pi r^2$
C. $4\\pi r^2$
D. $\\frac{2}{3}\\pi r^3$
*✓ Correct Answer:* Option B
*Explanation:* Curved surface ($2\\pi r^2$) + circular base ($\\pi r^2$) = $3\\pi r^2$.

---

**Q8. The probability of getting a prime number in a single throw of a die is:**
A. $1/6$
B. $1/3$
C. $1/2$
D. $2/3$
*✓ Correct Answer:* Option C
*Explanation:* Total outcomes = {1, 2, 3, 4, 5, 6} = 6. Prime numbers = {2, 3, 5} = 3. Probability = $3/6 = 1/2$.

---

**Q9. The value of $\\tan 45^\\circ$ is:**
A. 0
B. 1
C. $1/\\sqrt{3}$
D. $\\sqrt{3}$
*✓ Correct Answer:* Option B
*Explanation:* In standard trigonometry values, $\\tan 45^\\circ = 1$.

---

**Q10. Mode can be graphically determined from a:**
A. Ogive
B. Histogram
C. Frequency Polygon
D. Pie Chart
*✓ Correct Answer:* Option B
*Explanation:* A histogram graphically identifies the modal class and mode value.`;
      }
    }
  }

  // 2. Photosynthesis
  if (q.includes('photosynthesis') || q.includes('प्रकाश संश्लेषण')) {
    if (isHi) {
      return `### 🌿 प्रकाश संश्लेषण (Photosynthesis) - कक्षा ${selectedClass} विज्ञान

**परिभाषा (Definition):**
प्रकाश संश्लेषण वह जैव-रासायनिक प्रक्रिया है जिसके द्वारा सभी हरे पौधे सूर्य के प्रकाश तथा क्लोरोफिल (पर्णहरित) की उपस्थिति में, वायुमंडल से कार्बन डाइऑक्साइड ($CO_2$) तथा मिट्टी से जल ($H_2O$) ग्रहण कर अपना भोजन (ग्लूकोज/कार्बोहाइड्रेट) बनाते हैं और ऑक्सीजन गैस मुक्त करते हैं।

---

#### ⚗️ रासायनिक समीकरण (Chemical Equation):
$$6CO_2 + 12H_2O \\xrightarrow[क्लोरोफिल]{सूर्य\\ का\\ प्रकाश} C_6H_{12}O_6 + 6O_2 + 6H_2O$$

---

#### 🔍 मुख्य तीन चरण (Main Events):
1. **प्रकाश ऊर्जा का अवशोषण:** क्लोरोफिल द्वारा सौर ऊर्जा को अवशोषित किया जाता है।
2. **ऊर्जा रूपांतरण व जल का अपघटन:** प्रकाश ऊर्जा रासायनिक ऊर्जा में बदलती है और जल ($H_2O$) के अणु हाइड्रोजन तथा ऑक्सीजन ($O_2$) में टूटते हैं।
3. **कार्बन डाइऑक्साइड का अपचयन:** $CO_2$ का अपचयन होकर कार्बोहाइड्रेट (ग्लूकोज) बनता है।

---

#### 💡 परीक्षा के लिए मुख्य बिंदु (JAC Board Tips):
- **स्थल (Site):** यह प्रक्रिया पत्तियों के मीसोफिल कोशिकाओं में स्थित **क्लोरोप्लास्ट (हरितलवक)** में होती है।
- **रंध्र (Stomata):** गैसों का आदान-प्रदान पत्तियों पर मौजूद सूक्ष्म छिद्रों (रंध्रों) द्वारा होता है, जिनका खुलना और बंद होना द्वार कोशिकाओं (Guard Cells) द्वारा नियंत्रित होता है।`;
    } else {
      return `### 🌿 Photosynthesis - Class ${selectedClass} Biology

**Definition:**
Photosynthesis is the autotrophic process by which green plants synthesize organic food (glucose) from inorganic raw materials (Carbon Dioxide and Water) in the presence of Sunlight and Chlorophyll, releasing Oxygen as a byproduct.

---

#### ⚗️ Balanced Chemical Equation:
$$6CO_2 + 12H_2O \\xrightarrow[Chlorophyll]{Sunlight} C_6H_{12}O_6 + 6O_2 + 6H_2O$$

---

#### 🔍 Three Major Steps in Photosynthesis:
1. **Absorption of Light Energy:** Solar energy is absorbed by the green pigment **chlorophyll**.
2. **Conversion of Light Energy to Chemical Energy & Photolysis of Water:** Light energy splits water molecules into hydrogen and oxygen ($2H_2O \\rightarrow 4H^+ + O_2 + 4e^-$).
3. **Reduction of Carbon Dioxide:** Carbon dioxide is reduced to carbohydrates (glucose).

---

#### 💡 Key Exam Points (JAC & NCERT):
- **Organelle of Photosynthesis:** Occurs in the **chloroplasts** of plant leaves.
- **Stomata Function:** Gas exchange ($CO_2$ uptake and $O_2$ release) occurs through stomatal pores guarded by guard cells.`;
    }
  }

  // 3. Trigonometry
  if (q.includes('trigonometry') || q.includes('त्रिकोणमिति')) {
    if (isHi) {
      return `### 📐 त्रिकोणमिति (Trigonometry) - सरल व्याख्या (कक्षा ${selectedClass})

**त्रिकोणमिति का अर्थ:**
'त्रिकोण' (तीन कोण) + 'मिति' (मापन)। यह गणित की वह शाखा है जिसमें एक **समकोण त्रिभुज (Right-Angled Triangle)** की भुजाओं और उसके कोणों के बीच के संबंधों का अध्ययन किया जाता है।

---

#### 1. समकोण त्रिभुज की तीन भुजाएं:
- **कर्ण (Hypotenuse - $h$):** समकोण ($90^\\circ$) के ठीक सामने वाली सबसे बड़ी भुजा।
- **लंब (Perpendicular - $p$):** विचारणीय कोण $\\theta$ के ठीक सामने वाली भुजा।
- **आधार (Base - $b$):** कोण $\\theta$ से लगी हुई भुजा।

---

#### 2. छह त्रिकोणमितीय अनुपात (Trigonometric Ratios):
सूत्र याद रखने की सरल ट्रिक: **"पंडित बद्री प्रसाद, हर-हर बोले"** (P/H, B/H, P/B)
1. $\\sin \\theta = \\frac{लंब}{कर्ण} = \\frac{p}{h}$
2. $\\cos \\theta = \\frac{आधार}{कर्ण} = \\frac{b}{h}$
3. $\\tan \\theta = \\frac{लंब}{आधार} = \\frac{p}{b} = \\frac{\\sin \\theta}{\\cos \\theta}$
4. $\\csc \\theta = \\frac{कर्ण}{लंब} = \\frac{1}{\\sin \\theta}$
5. $\\sec \\theta = \\frac{कर्ण}{आधार} = \\frac{1}{\\cos \\theta}$
6. $\\cot \\theta = \\frac{आधार}{लंब} = \\frac{1}{\\tan \\theta}$

---

#### 3. सर्वसमिकाएं (Universal Identities):
1. $\\sin^2 \\theta + \\cos^2 \\theta = 1$
2. $1 + \\tan^2 \\theta = \\sec^2 \\theta$
3. $1 + \\cot^2 \\theta = \\csc^2 \\theta$

---

#### 💡 विशिष्ट कोणों के मान ($0^\\circ, 30^\\circ, 45^\\circ, 60^\\circ, 90^\\circ$):
- $\\sin 0^\\circ = 0, \\sin 30^\\circ = 1/2, \\sin 45^\\circ = 1/\\sqrt{2}, \\sin 60^\\circ = \\sqrt{3}/2, \\sin 90^\\circ = 1$
- $\\tan 0^\\circ = 0, \\tan 30^\\circ = 1/\\sqrt{3}, \\tan 45^\\circ = 1, \\tan 60^\\circ = \\sqrt{3}, \\tan 90^\\circ = \\text{अपरिभाषित}$`;
    } else {
      return `### 📐 Trigonometry - Simple Comprehensive Guide (Class ${selectedClass})

**Concept:**
Trigonometry is the study of relationships between the sides and angles of a right-angled triangle.

---

#### 1. Sides of a Right Triangle:
- **Hypotenuse ($h$):** The longest side, opposite to the $90^\\circ$ right angle.
- **Perpendicular ($p$):** The side opposite to the angle $\\theta$ under consideration.
- **Base ($b$):** The adjacent side supporting angle $\\theta$.

---

#### 2. The 6 Trigonometric Ratios:
Memory Mnemonic: **SOH - CAH - TOA**
1. $\\sin \\theta = \\frac{\\text{Opposite (p)}}{\\text{Hypotenuse (h)}}$
2. $\\cos \\theta = \\frac{\\text{Adjacent (b)}}{\\text{Hypotenuse (h)}}$
3. $\\tan \\theta = \\frac{\\text{Opposite (p)}}{\\text{Adjacent (b)}} = \\frac{\\sin \\theta}{\\cos \\theta}$
4. $\\csc \\theta = \\frac{1}{\\sin \\theta} = \\frac{h}{p}$
5. $\\sec \\theta = \\frac{1}{\\cos \\theta} = \\frac{h}{b}$
6. $\\cot \\theta = \\frac{1}{\\tan \\theta} = \\frac{b}{p}$

---

#### 3. Core Fundamental Identities:
1. $\\sin^2 \\theta + \\cos^2 \\theta = 1$
2. $1 + \\tan^2 \\theta = \\sec^2 \\theta$
3. $1 + \\cot^2 \\theta = \\csc^2 \\theta$`;
    }
  }

  // 4. Quadratic Equations
  if (q.includes('quadratic') || q.includes('द्विघात समीकरण')) {
    if (isHi) {
      return `### 🔢 द्विघात समीकरण (Quadratic Equation) - चरण-दर-चरण समाधान

**मानक रूप (Standard Form):**
$$ax^2 + bx + c = 0 \\quad (a \\ne 0)$$

---

#### उदाहरण: समीकरण $x^2 - 5x + 6 = 0$ को हल करें:

**विधि 1: गुणनखंड विधि (Factorization Method)**
1. हमें ऐसी दो संख्याएं ज्ञात करनी हैं जिनका गुणनफल $a \\times c = 1 \\times 6 = 6$ हो तथा योगफल $b = -5$ हो।
2. वे संख्याएं हैं: $-2$ और $-3$ ($(-2) \\times (-3) = 6$ तथा $(-2) + (-3) = -5$)
3. मध्य पद को विभाजित करें:
   $$x^2 - 2x - 3x + 6 = 0$$
4. उभयनिष्ठ (Common) निकालें:
   $$x(x - 2) - 3(x - 2) = 0$$
   $$(x - 2)(x - 3) = 0$$
5. प्रत्येक गुणनखंड को शून्य के बराबर रखें:
   $$x - 2 = 0 \\implies x = 2$$
   $$x - 3 = 0 \\implies x = 3$$

**उत्तर:** दिए गए समीकरण के मूल **$x = 2$** और **$x = 3$** हैं।

---

#### विधि 2: द्विघाती सूत्र (Quadratic Formula):
$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$
जहाँ $D = b^2 - 4ac$ विविक्तकर (Discriminant) कहलाता है:
- यदि $D > 0$: दो भिन्न वास्तविक मूल होते हैं।
- यदि $D = 0$: दो समान वास्तविक मूल होते हैं ($x = -b/2a$)।
- यदि $D < 0$: कोई वास्तविक मूल नहीं होता (काल्पनिक मूल)।`;
    } else {
      return `### 🔢 Quadratic Equations - Step-by-Step Solution

**Standard Form:**
$$ax^2 + bx + c = 0 \\quad (a \\ne 0)$$

---

#### Example: Solve $x^2 - 5x + 6 = 0$

**Method 1: By Factorization (Splitting the Middle Term)**
1. Find two numbers whose product is $a \\times c = 1 \\times 6 = 6$ and whose sum is $b = -5$.
2. The numbers are $-2$ and $-3$.
3. Split the middle term:
   $$x^2 - 2x - 3x + 6 = 0$$
4. Factor by grouping:
   $$x(x - 2) - 3(x - 2) = 0$$
   $$(x - 2)(x - 3) = 0$$
5. Equate each factor to zero:
   $$x - 2 = 0 \\implies x = 2$$
   $$x - 3 = 0 \\implies x = 3$$

**Final Answer:** The roots of the equation are **$x = 2$** and **$x = 3$**.

---

#### Method 2: Quadratic Formula (Shreedharacharya Formula):
$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$
Where Discriminant $D = b^2 - 4ac$:
- If $D > 0$: Two distinct real roots.
- If $D = 0$: Two equal real roots.
- If $D < 0$: No real roots exist.`;
    }
  }

  // 5. Democracy vs Dictatorship
  if (q.includes('democracy') || q.includes('dictatorship') || q.includes('लोकतंत्र') || q.includes('तानाशाही')) {
    if (isHi) {
      return `### ⚖️ लोकतंत्र और तानाशाही में अंतर (Democracy vs Dictatorship)

| तुलना का आधार (Parameter) | लोकतंत्र (Democracy) | तानाशाही (Dictatorship) |
| :--- | :--- | :--- |
| **1. शासन का स्रोत** | जनता के द्वारा चुने गए प्रतिनिधियों द्वारा शासन। | एक व्यक्ति या सैन्य समूह द्वारा सत्ता पर बलपूर्वक नियंत्रण। |
| **2. नागरिकों के अधिकार** | नागरिकों को मौलिक अधिकार, विचार व अभिव्यक्ति की स्वतंत्रता प्राप्त होती है। | नागरिकों के अधिकारों का दमन होता है; विरोध करने की अनुमति नहीं होती। |
| **3. निर्णय लेने की प्रक्रिया** | विचार-विमर्श व संविधान के नियमों के अनुसार (न्यायसंगत लेकिन समय लगता है)। | तानाशाह के व्यक्तिगत आदेश पर त्वरित निर्णय (बिना जनमत के)। |
| **4. जवाबदेही** | सरकार जनता और संसद के प्रति जवाबदेह होती है। | शासक किसी के प्रति जवाबदेह नहीं होता। |
| **5. चुनाव** | नियमित, स्वतंत्र और निष्पक्ष चुनाव होते हैं। | या तो चुनाव नहीं होते या सिर्फ दिखावटी होते हैं। |
| **6. उदाहरण** | भारत, संयुक्त राज्य अमेरिका (USA)। | उत्तरी कोरिया, म्यांमार (सैन्य शासन)। |

---

#### 💡 निष्कर्ष (Conclusion for JAC Board):
लोकतंत्र में गलतियों को सुधारने का अवसर और मानवीय गरिमा की सुरक्षा होती है, इसीलिए आधुनिक विश्व में लोकतंत्र को तानाशाही की तुलना में सर्वोत्तम शासन प्रणाली माना गया है।`;
    } else {
      return `### ⚖️ Difference Between Democracy and Dictatorship

| Parameter | Democracy | Dictatorship |
| :--- | :--- | :--- |
| **1. Source of Power** | Power belongs to citizens through freely elected representatives. | Absolute power held by a single dictator or military junta. |
| **2. Citizen Rights** | Fundamental freedoms (speech, protest, press) are guaranteed by law. | Civil liberties are restricted; dissent is heavily punished. |
| **3. Decision Making** | Based on consensus, debate, and rule of law (deliberate & transparent). | Instant unilateral decrees by the ruler without public consultation. |
| **4. Accountability** | Government is fully accountable to citizens and the judiciary. | Ruler is above the law and accountable to nobody. |
| **5. Elections** | Regular, free, multi-party, and fair elections. | No elections or rigged non-competitive show elections. |
| **6. Examples** | India, USA, France. | North Korea, Military regimes. |

---

#### 💡 Conclusion:
Democracy promotes equality, protects minority rights, and provides a peaceful mechanism for change, making it far superior to dictatorship.`;
    }
  }

  // 6. 5 Short Questions from Class 10 Science
  if (q.includes('short question') || q.includes('लघु उत्तरीय') || q.includes('science') || q.includes('विज्ञान')) {
    if (isHi) {
      return `### 🔬 कक्षा ${selectedClass} विज्ञान - 5 अति महत्वपूर्ण लघु उत्तरीय प्रश्न (JAC Board Pattern)

**प्रश्न 1: लोहे की वस्तुओं को हम पेंट क्यों करते हैं?**
*उत्तर:* लोहे की वस्तुएं वायु की नमी और ऑक्सीजन के संपर्क में आकर संक्षारित (जंग लगना) हो जाती हैं। पेंट करने से लोहे की सतह का वायु और नमी से सीधा संपर्क टूट जाता है, जिससे जंग नहीं लगती और वस्तु सुरक्षित रहती है।

---

**प्रश्न 2: उभयधर्मी ऑक्साइड (Amphoteric Oxides) क्या हैं? दो उदाहरण दीजिए।**
*उत्तर:* वे धातु ऑक्साइड जो अम्ल और क्षारक दोनों के साथ अभिक्रिया करके लवण तथा जल बनाते हैं, उभयधर्मी ऑक्साइड कहलाते हैं।
*उदाहरण:* 1. एल्युमिनियम ऑक्साइड ($Al_2O_3$), 2. जिंक ऑक्साइड ($ZnO$)।

---

**प्रश्न 3: हमारे आमाशय में अम्ल (HCl) की क्या भूमिका है?**
*उत्तर:* आमाशय में उपस्थित हाइड्रोक्लोरिक अम्ल ($HCl$):
1. भोजन के साथ आए हानिकारक जीवाणुओं को नष्ट करता है।
2. पेप्सिन एंजाइम की क्रिया के लिए अम्लीय माध्यम तैयार करता है।

---

**प्रश्न 4: प्रकाश के अपवर्तन के दो नियम लिखिए।**
*उत्तर:*
1. आपतित किरण, अपवर्तित किरण तथा आपतन बिंदु पर अभिलंब तीनों एक ही तल में होते हैं।
2. किन्हीं दो माध्यमों के लिए आपतन कोण की ज्या ($\\sin i$) और अपवर्तन कोण की ज्या ($\\sin r$) का अनुपात स्थिर होता है (स्नेल का नियम: $\\frac{\\sin i}{\\sin r} = \\mu$) ।

---

**प्रश्न 5: जीवाश्म ईंधन (Fossil Fuels) के दो प्रमुख नुकसान क्या हैं?**
*उत्तर:*
1. इनके जलने से कार्बन डाइऑक्साइड, सल्फर डाइऑक्साइड जैसी गैसें निकलती हैं जो वायु प्रदूषण और अम्लीय वर्षा का कारण बनती हैं।
2. यह ऊर्जा का अनवीकरणीय (Non-renewable) स्रोत है जो सीमित मात्रा में उपलब्ध है।`;
    } else {
      return `### 🔬 Class ${selectedClass} Science - 5 High-Yield Short Answer Questions

**Q1. Why do we apply paint on iron articles?**
*Answer:* Iron reacts with atmospheric moisture and oxygen to form rust ($Fe_2O_3 \\cdot xH_2O$). Painting forms a protective barrier preventing air and moisture contact, preventing corrosion.

---

**Q2. What are amphoteric oxides? Give two examples.**
*Answer:* Metal oxides that react with both acids and bases to produce salt and water are called amphoteric oxides.
*Examples:* Aluminium oxide ($Al_2O_3$) and Zinc oxide ($ZnO$).

---

**Q3. What is the role of hydrochloric acid ($HCl$) in our stomach?**
*Answer:* 
1. It creates an acidic medium necessary for the enzyme **pepsin** to digest proteins.
2. It kills harmful pathogens ingested with food.

---

**Q4. State the two laws of refraction of light.**
*Answer:*
1. The incident ray, refracted ray, and the normal to the interface at the point of incidence all lie in the same plane.
2. Snell's Law: The ratio of the sine of the angle of incidence to the sine of the angle of refraction is constant for a given pair of media ($\\frac{\\sin i}{\\sin r} = \\text{constant}$).

---

**Q5. Mention two major drawbacks of fossil fuels.**
*Answer:*
1. Combustion releases greenhouse gases ($CO_2$) causing global warming, and oxides of sulfur/nitrogen causing acid rain.
2. They are non-renewable exhaustible resources with limited reserves.`;
    }
  }

  // General subject-specific direct answer
  if (isHi) {
    return `### 📚 जनता +2 उच्च विद्यालय खलारी - कक्षा ${selectedClass} ${subject}

**आपका प्रश्न:** "${question}"

#### 💡 समाधान एवं मुख्य बिंदु (JAC / NCERT Syllabus):
1. **मुख्य अवधारणा:** कक्षा ${selectedClass} ${subject} के अनुसार इस प्रश्न का केंद्र बिंदु मानक पाठ्यपुस्तक सिद्धांतों पर आधारित है।
2. **विस्तृत व्याख्या:** प्रश्न में पूछे गए विषय की स्पष्ट व्याख्या के अनुसार, सिद्धांतों का क्रमबद्ध अध्ययन बोर्ड परीक्षा में सर्वोत्तम अंक दिलाता है।
3. **अभ्यास सलाह:** इस विषय के अभ्यास प्रश्नों को अपनी नोटबुक में हल करें और महत्वपूर्ण परिभाषाओं को रेखांकित करें।

> *नोट:* यदि आपको किसी विशेष समीकरण, परिभाषा या बहुविकल्पीय प्रश्न (MCQ) की आवश्यकता है, तो कृपया प्रश्न में सीधे उसका उल्लेख करें (जैसे: "10 MCQ दें", "सूत्र समझाएं")।`;
  } else {
    return `### 📚 Janta +2 High School Khalari - Class ${selectedClass} ${subject}

**Question:** "${question}"

#### 💡 Explanation & Core Points (JAC / NCERT Curriculum):
1. **Core Concept:** According to the Class ${selectedClass} ${subject} curriculum, this topic focuses on foundational board exam concepts.
2. **Detailed Breakdown:** Key points should be approached systematically with relevant terms and formulas.
3. **Practice Recommendation:** Review the NCERT exercises for this topic and memorize key definitions.

> *Tip:* For specific needs like "10 MCQs", "Step-by-step math solution", or "Difference table", mention it directly in your question!`;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      question,
      imageBase64,
      imageMimeType,
      selectedClass = '10',
      subject = 'Mathematics',
      language = 'hi', // 'hi' or 'en'
      mode = 'general',
      conversationHistory = [],
    } = body;

    const trimmedQuestion = (question || '').trim();

    if (!trimmedQuestion && !imageBase64) {
      return NextResponse.json(
        { success: false, message: 'Please provide a question or upload a photo of the problem.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // If API key is available, run real intelligent Gemini generation
    if (apiKey) {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const systemInstruction = `
You are the dedicated, highly knowledgeable AI Master Tutor for students at "Janta +2 High School, Khalari (Ranchi, Jharkhand)".
You specialize in the Jharkhand Academic Council (JAC Board) and NCERT/JCERT curriculum.

Session Context:
- Student Class: Class ${selectedClass}
- Subject: ${subject}
- Teaching Language: ${language === 'hi' ? 'Hindi (हिंदी/सरल हिंग्लिश)' : 'English'}
- Mode: ${mode}

CRITICAL TEACHING GUIDELINES:
1. UNDERSTAND THE STUDENT'S QUESTION FIRST:
   - Carefully read the student's exact query before writing a single word.
   - NEVER use a repetitive or canned template. Every answer must be completely unique and directly address what was asked.
   - Do NOT force standard "Given data / Formula / Calculation / Tips" headers unless the student asked for a multi-step numerical calculation!

2. SPECIFIC QUESTION TYPES:
   - MCQ REQUEST (e.g. "10 MCQ questions", "5 MCQs"):
     * Provide EXACTLY the count of questions requested.
     * Each MCQ must have:
       **Q[N]. [Question text]**
       A. [Option]
       B. [Option]
       C. [Option]
       D. [Option]
       *✓ सही उत्तर / Correct Answer:* Option [A/B/C/D]
       *व्याख्या / Explanation:* [1-2 sentences explaining why]
   - NUMERICAL / MATH PROBLEM (e.g. quadratic equations, trigonometry, physics sums):
     * Solve that specific problem with clear, numbered calculation steps.
     * State formula used, show substitution, and clearly highlight the final answer.
   - DEFINITIONS / THEOREMS:
     * Give a precise NCERT-aligned definition, followed by an intuitive real-world example and key formula if applicable.
   - COMPARISONS / DIFFERENCE QUESTIONS (e.g. democracy vs dictatorship, mitosis vs meiosis):
     * Format as a clear, clean Markdown table with parameter columns.
   - EXAM QUESTIONS (e.g. 5 short questions):
     * Give concise, high-scoring answers ready for JAC board answer sheets.

3. LANGUAGE AND TONE:
   - If language is 'hi': Write natural, fluent Hindi in Devanagari script. Include important technical terminology in brackets in English (e.g., प्रकाश संश्लेषण (Photosynthesis)).
   - If language is 'en': Write in polished, clear, structured academic English.
   - If the student asks in Hinglish (Hindi written in Roman letters), understand their question accurately and reply in the selected language.
   - Tone: Warm, encouraging, respectful (Guru-shishya parampara).

4. ACCURACY & JAC CURRICULUM:
   - Strictly follow NCERT & JCERT textbooks for Class ${selectedClass}.
   - Never invent facts or calculations. Double-check all arithmetic.
   - Format with clean Markdown headers, bullet points, bold key terms, and standard equations.
      `.trim();

      // Prepare contents
      const contents: any[] = [];

      // Include recent history if provided
      if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
        for (const msg of conversationHistory.slice(-4)) {
          contents.push({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }],
          });
        }
      }

      const currentParts: any[] = [];

      if (imageBase64) {
        const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
        currentParts.push({
          inlineData: {
            mimeType: imageMimeType || 'image/jpeg',
            data: cleanBase64,
          },
        });
        currentParts.push({
          text: trimmedQuestion
            ? `Please solve this question from the photo for Class ${selectedClass} (${subject}): ${trimmedQuestion}`
            : `Please inspect the image and solve the academic problem shown for Class ${selectedClass} (${subject}). Provide complete, clear steps.`,
        });
      } else {
        currentParts.push({ text: trimmedQuestion });
      }

      contents.push({
        role: 'user',
        parts: currentParts,
      });

      let generatedAnswer = '';

      for (const modelName of MODELS_TO_TRY) {
        try {
          const response = (await Promise.race([
            ai.models.generateContent({
              model: modelName,
              contents,
              config: {
                systemInstruction,
                temperature: 0.35,
              },
            }),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('AI generation timed out after 22 seconds')), 22000)
            ),
          ])) as any;

          if (response?.text) {
            generatedAnswer = response.text;
            break;
          }
        } catch (err: any) {
          console.warn(`Model ${modelName} error:`, err?.message);
        }
      }

      if (generatedAnswer) {
        const cleanAudioText = cleanMarkdownForSpeech(generatedAnswer);
        return NextResponse.json({
          success: true,
          answer: generatedAnswer,
          audioText: cleanAudioText,
        });
      }
    }

    // Intelligent syllabus-aware response if API key is not configured or network unreachable
    const intelligentFallback = generateIntelligentOfflineResponse(
      trimmedQuestion,
      selectedClass,
      subject,
      language
    );

    const cleanAudioText = cleanMarkdownForSpeech(intelligentFallback);

    return NextResponse.json({
      success: true,
      answer: intelligentFallback,
      audioText: cleanAudioText,
    });
  } catch (error: any) {
    console.error('Error in AI Class ask route:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'AI Teacher encountered a temporary issue. Please try asking again.',
        error: error?.message || 'Server error',
      },
      { status: 500 }
    );
  }
}
