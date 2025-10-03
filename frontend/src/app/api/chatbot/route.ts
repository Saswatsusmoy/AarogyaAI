import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Simple rule-based responses for common health queries
    const response = generateHealthResponse(message.toLowerCase());

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Chatbot API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function generateHealthResponse(message: string): string {
  // Health advice patterns
  if (message.includes("fever") || message.includes("temperature")) {
    return "If you have a fever above 100.4°F (38°C), especially with other symptoms like chills, body aches, or fatigue, I recommend monitoring your temperature and staying hydrated. If the fever persists for more than 3 days or reaches 103°F (39.4°C) or higher, please consult a healthcare provider immediately.";
  }

  if (message.includes("headache") || message.includes("head pain")) {
    return "Headaches can have various causes. For mild headaches, try rest, hydration, and over-the-counter pain relievers (if not contraindicated). However, if you experience sudden, severe headaches, headaches with fever, neck stiffness, or vision changes, seek immediate medical attention.";
  }

  if (message.includes("cough") || message.includes("cold")) {
    return "For common cold symptoms like cough and congestion, rest, stay hydrated, use a humidifier, and consider over-the-counter remedies. If symptoms persist for more than 10 days, worsen, or include high fever, shortness of breath, or chest pain, please consult a healthcare provider.";
  }

  if (message.includes("stomach") || message.includes("nausea") || message.includes("vomiting")) {
    return "For stomach issues, try the BRAT diet (bananas, rice, applesauce, toast) and stay hydrated with clear fluids. Avoid dairy and spicy foods. If symptoms include severe pain, persistent vomiting, signs of dehydration, or blood in vomit/stool, seek medical attention immediately.";
  }

  if (message.includes("sleep") || message.includes("insomnia")) {
    return "Good sleep hygiene includes maintaining a regular sleep schedule, avoiding caffeine late in the day, creating a comfortable sleep environment, and limiting screen time before bed. If sleep problems persist and affect your daily functioning, consider discussing with a healthcare provider.";
  }

  if (message.includes("exercise") || message.includes("fitness") || message.includes("workout")) {
    return "Regular physical activity is important for overall health. Aim for at least 150 minutes of moderate-intensity exercise per week. Start gradually if you're new to exercise, and always consult with a healthcare provider before beginning a new exercise program, especially if you have existing health conditions.";
  }

  if (message.includes("diet") || message.includes("nutrition") || message.includes("eating")) {
    return "A balanced diet includes fruits, vegetables, whole grains, lean proteins, and healthy fats. Limit processed foods, added sugars, and excessive sodium. Stay hydrated by drinking plenty of water. For personalized dietary advice, consider consulting with a registered dietitian.";
  }

  if (message.includes("stress") || message.includes("anxiety") || message.includes("mental health")) {
    return "Managing stress is important for overall health. Techniques include deep breathing, meditation, regular exercise, adequate sleep, and maintaining social connections. If you're experiencing persistent anxiety, depression, or thoughts of self-harm, please seek help from a mental health professional immediately.";
  }

  if (message.includes("blood pressure") || message.includes("hypertension")) {
    return "Normal blood pressure is generally considered less than 120/80 mmHg. High blood pressure often has no symptoms, so regular monitoring is important. Lifestyle changes like reducing sodium, regular exercise, and maintaining a healthy weight can help. Always follow your healthcare provider's recommendations for blood pressure management.";
  }

  if (message.includes("diabetes") || message.includes("blood sugar")) {
    return "Diabetes management involves monitoring blood sugar levels, following a balanced diet, regular exercise, and taking medications as prescribed. Regular check-ups with your healthcare provider are essential. If you experience symptoms like excessive thirst, frequent urination, or unexplained weight loss, consult your healthcare provider.";
  }

  if (message.includes("vaccination") || message.includes("vaccine") || message.includes("immunization")) {
    return "Vaccinations are an important part of preventive healthcare. They help protect against serious diseases. Talk to your healthcare provider about which vaccinations are recommended for your age group and health status. Keep a record of your vaccinations for future reference.";
  }

  if (message.includes("emergency") || message.includes("urgent") || message.includes("immediately")) {
    return "If you're experiencing a medical emergency such as chest pain, difficulty breathing, severe bleeding, signs of stroke, or severe allergic reactions, call emergency services (911) immediately. Don't delay seeking emergency care.";
  }

  // General health tips
  if (message.includes("prevent") || message.includes("prevention")) {
    return "Preventive healthcare includes regular check-ups, vaccinations, healthy lifestyle choices (diet, exercise, sleep), stress management, and avoiding harmful substances like tobacco and excessive alcohol. Early detection of health issues through regular screenings can improve outcomes.";
  }

  if (message.includes("checkup") || message.includes("physical") || message.includes("exam")) {
    return "Regular health check-ups are important for maintaining good health and early detection of potential issues. The frequency depends on your age, health status, and risk factors. Your healthcare provider can recommend an appropriate schedule for your individual needs.";
  }

  // Default response for unrecognized queries
  return "Thank you for your health-related question. I've provided some general information, but remember that this is not a substitute for professional medical advice. For personalized medical guidance, diagnosis, or treatment, please consult with a qualified healthcare provider. Is there anything else I can help you with regarding your health?";
}
