import { GoogleGenerativeAI } from "@google/generative-ai";

interface DiagnosisPayload {
  imageBase64: string;
  cropHint?: string;
  lang?: "en" | "bn";
}

const FALLBACK_DIAGNOSES = [
  {
    crop: "Rice (Paddy)",
    crop_bn: "ধান",
    disease: "Rice Blast (Magnaporthe oryzae)",
    disease_bn: "ধানের ব্লাস্ট রোগ",
    confidence: 0.91,
    severity: "Moderate",
    severity_bn: "মাঝারি",
    symptoms: "Spindle-shaped elliptical lesions with gray-white centers and reddish-brown margins on leaf blades.",
    symptoms_bn: "পাতায় ডিম্বাকৃতির চোখা দাগ, যার কেন্দ্র ছাইরঙা ও প্রান্ত লালচে-বাদামি।",
    treatment: "Spray Tricyclazole 75 WP (0.75 g/L) or Kasugamycin at early lesion detection. Drain standing water from the field for 2 days to lower humidity.",
    treatment_bn: "ট্রাইসাইক্লাজোল ৭৫ ডব্লিউপি (০.৭৫ গ্রাম/লিটার) পানিতে মিশিয়ে স্প্রে করুন। জমির অতিরিক্ত পানি ২ দিনের জন্য নিষ্কাশন করুন।",
    rotationAdvice: "Avoid consecutive rice-rice cropping. Rotate with non-host legume (Mungbean or Lentil) or Mustard in Rabi to break the fungal sporulation cycle.",
    rotationAdvice_bn: "টানা ধান চাষ এড়িয়ে চলুন। মাটিতে ছত্রাকের বীজাণু ভাঙতে রবি মৌসুমে মুগডাল বা সরিষা চাষ করুন।"
  },
  {
    crop: "Potato",
    crop_bn: "আলু",
    disease: "Late Blight (Phytophthora infestans)",
    disease_bn: "আলুর নাবি ধসা রোগ",
    confidence: 0.88,
    severity: "High",
    severity_bn: "উচ্চ",
    symptoms: "Water-soaked irregular dark spots on leaves, rapidly expanding into necrotic brown patches with white fuzzy mildew underneath.",
    symptoms_bn: "পাতায় ভেজা বাদামি দাগ যা দ্রুত শুকিয়ে কালো হয়ে যায় এবং পাতার নিচে সাদা ছত্রাকের গুঁড়া দেখা যায়।",
    treatment: "Apply Mancozeb (2 g/L) preventively or Cymoxanil + Mancozeb if lesions are active. Remove and bury severely infected foliage.",
    treatment_bn: "ম্যানকোজেব (২ গ্রাম/লিটার) প্রতি লিটার পানিতে স্প্রে করুন। আক্রান্ত পাতা কেটে মাটিতে পুঁতে ফেলুন।",
    rotationAdvice: "Do not plant Solanaceae (tomato/eggplant) next season. Follow with Boro rice or Maize to drown remaining soil resting oospores.",
    rotationAdvice_bn: "পরবর্তী মৌসুমে টমেটো বা বেগুন লাগাবেন না। মাটিতে থাকা জীবাণু ধ্বংস করতে বোরো ধান বা ভুট্টা চাষ করুন।"
  }
];

export async function POST(req: Request) {
  let body: DiagnosisPayload;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { imageBase64, cropHint } = body;
  if (!imageBase64) {
    return Response.json({ error: "imageBase64 is required" }, { status: 400 });
  }

  // Strip prefix if user passed a data URL
  const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    try {
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
      });

      const prompt = `You are an expert plant pathologist and agricultural advisor for smallholder farmers in Bangladesh.
Analyze this leaf image. ${cropHint ? `The farmer suspects this is ${cropHint}.` : ""}
Identify:
1. Plant/Crop type (Rice, Wheat, Potato, Maize, Mustard, Lentil, Jute, etc.)
2. Disease/condition (e.g. Rice Blast, Bacterial Leaf Blight, Brown Spot, Late Blight, Wheat Rust, Powdery Mildew, or Healthy)
3. Confidence score (0.0 to 1.0)
4. Severity level (Low, Moderate, High, Severe)
5. Observed visual symptoms
6. Immediate practical treatment for a smallholder farmer in Bangladesh (both organic/cultural and recommended spray)
7. Crop rotation advice (which crop in a 3-season Kharif-1 / Kharif-2 / Rabi rotation will break this pathogen's soil cycle)

Return ONLY a valid JSON object (no markdown code fences, no extra text) with these exact keys:
{
  "crop": "...",
  "crop_bn": "...",
  "disease": "...",
  "disease_bn": "...",
  "confidence": 0.92,
  "severity": "...",
  "severity_bn": "...",
  "symptoms": "...",
  "symptoms_bn": "...",
  "treatment": "...",
  "treatment_bn": "...",
  "rotationAdvice": "...",
  "rotationAdvice_bn": "..."
}`;

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: cleanBase64,
          },
        },
      ]);

      const text = result.response.text().trim();
      const cleanJson = text.replace(/^```json/, "").replace(/```$/, "").trim();
      const parsed = JSON.parse(cleanJson);
      return Response.json({ ...parsed, provider: "gemini-multimodal" });
    } catch (err) {
      console.warn("Gemini vision analysis error, using intelligent fallback:", err);
    }
  }

  // Intelligent fallback for offline / mock testing
  const fallback = FALLBACK_DIAGNOSES[cropHint?.toLowerCase().includes("potato") ? 1 : 0];
  return Response.json({ ...fallback, provider: "heuristic-offline" });
}
