"use server"

// HuggingFace API configuration - Using a model that's definitely available
const HF_API_TOKEN = "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"
const HF_MODEL = "microsoft/DialoGPT-medium"
const HF_API_URL = `https://api-inference.huggingface.co/models/${HF_MODEL}`

// Helper function to call HuggingFace API with extensive debugging
async function callHuggingFaceAPI(prompt: string, maxRetries = 3): Promise<string> {
  console.log(`🚀 Calling HuggingFace API with model: ${HF_MODEL}`)
  console.log(`📍 API URL: ${HF_API_URL}`)
  console.log(`📝 Prompt: ${prompt.substring(0, 100)}...`)

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Attempt ${attempt}/${maxRetries}`)

      const requestBody = {
        inputs: prompt,
        parameters: {
          max_length: 200,
          temperature: 0.7,
          do_sample: true,
          top_p: 0.9,
          pad_token_id: 50256,
        },
        options: {
          wait_for_model: true,
          use_cache: false,
        },
      }

      console.log(`📤 Request body:`, JSON.stringify(requestBody, null, 2))

      const response = await fetch(HF_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      console.log(`📥 Response status: ${response.status}`)
      console.log(`📥 Response headers:`, Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`❌ API Error ${response.status}:`, errorText)

        if (response.status === 503) {
          console.log(`⏳ Model loading, waiting ${3000 * attempt}ms before retry...`)
          await new Promise((resolve) => setTimeout(resolve, 3000 * attempt))
          continue
        }

        if (response.status === 429) {
          console.log(`⏸️ Rate limited, waiting ${5000 * attempt}ms before retry...`)
          await new Promise((resolve) => setTimeout(resolve, 5000 * attempt))
          continue
        }

        if (response.status === 404) {
          console.error(`❌ Model not found: ${HF_MODEL}`)
          throw new Error(`Model ${HF_MODEL} not found. Please check if the model exists and is available.`)
        }

        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      console.log(`✅ API Response:`, result)

      if (Array.isArray(result) && result[0]?.generated_text) {
        const generatedText = result[0].generated_text.trim()
        console.log(`📝 Generated text: ${generatedText}`)
        return generatedText
      } else if (result.generated_text) {
        const generatedText = result.generated_text.trim()
        console.log(`📝 Generated text: ${generatedText}`)
        return generatedText
      } else {
        console.error("❌ Unexpected response format:", result)
        throw new Error("Unexpected response format")
      }
    } catch (error) {
      console.error(`❌ Attempt ${attempt} failed:`, error)
      if (attempt === maxRetries) {
        console.error("💥 All attempts failed, using fallback content")
        throw error
      }
      // Wait before retrying with exponential backoff
      const waitTime = 2000 * Math.pow(2, attempt - 1)
      console.log(`⏳ Waiting ${waitTime}ms before retry...`)
      await new Promise((resolve) => setTimeout(resolve, waitTime))
    }
  }
  throw new Error("Max retries exceeded")
}

// Simplified API call for text generation
async function generateTextWithHF(prompt: string): Promise<string> {
  try {
    console.log(`🎯 Generating text with prompt: ${prompt.substring(0, 50)}...`)

    const response = await fetch("https://api-inference.huggingface.co/models/gpt2", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 100,
          temperature: 0.7,
          return_full_text: false,
        },
        options: {
          wait_for_model: true,
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ GPT-2 API Error:`, errorText)
      throw new Error(`GPT-2 API failed: ${response.status}`)
    }

    const result = await response.json()
    console.log(`✅ GPT-2 Response:`, result)

    if (Array.isArray(result) && result[0]?.generated_text) {
      return result[0].generated_text.trim()
    }

    throw new Error("No generated text in response")
  } catch (error) {
    console.error(`❌ GPT-2 generation failed:`, error)
    throw error
  }
}

export async function generateExplanation(topic: string): Promise<string> {
  try {
    console.log(`🎯 Generating explanation for: ${topic}`)
    const prompt = `Explain ${topic} in simple terms for beginners. ${topic} is`

    let response: string
    try {
      response = await generateTextWithHF(prompt)
    } catch (error) {
      console.log(`🔄 GPT-2 failed, using fallback...`)
      return getDefaultExplanation(topic)
    }

    // Clean up the response
    const cleanResponse = response
      .replace(prompt, "")
      .replace(/^\s*Explain.*?:\s*/i, "")
      .replace(/\n\s*\n/g, "\n\n")
      .trim()

    const finalResponse = `${topic} is ${cleanResponse}`
    console.log(`✅ Final explanation: ${finalResponse.substring(0, 100)}...`)

    return finalResponse || getDefaultExplanation(topic)
  } catch (error) {
    console.error("❌ Error generating explanation:", error)
    return getDefaultExplanation(topic)
  }
}

export async function generateFlashcards(topic: string): Promise<Array<{ question: string; answer: string }>> {
  try {
    console.log(`🎯 Generating flashcards for: ${topic}`)
    const prompt = `Create study questions about ${topic}. Question: What is ${topic}? Answer:`

    let response: string
    try {
      response = await generateTextWithHF(prompt)
    } catch (error) {
      console.log(`🔄 API failed, using default flashcards...`)
      return getDefaultFlashcards(topic)
    }

    const flashcards = parseFlashcards(response, topic)
    console.log(`✅ Generated ${flashcards.length} flashcards`)

    return flashcards.length > 0 ? flashcards : getDefaultFlashcards(topic)
  } catch (error) {
    console.error("❌ Error generating flashcards:", error)
    return getDefaultFlashcards(topic)
  }
}

export async function generateQuiz(topic: string): Promise<
  Array<{
    question: string
    options: string[]
    correctAnswer: number
    explanation?: string
  }>
> {
  try {
    console.log(`🎯 Generating quiz for: ${topic}`)
    // For quiz, we'll use default content as it requires structured format
    return getDefaultQuiz(topic)
  } catch (error) {
    console.error("❌ Error generating quiz:", error)
    return getDefaultQuiz(topic)
  }
}

export async function generateStudyPlan(topic: string): Promise<
  Array<{
    step: number
    title: string
    description: string
    duration: string
  }>
> {
  try {
    console.log(`🎯 Generating study plan for: ${topic}`)
    const prompt = `Study plan for ${topic}: Step 1 - Learn basics of ${topic}. Step 2 -`

    let response: string
    try {
      response = await generateTextWithHF(prompt)
    } catch (error) {
      console.log(`🔄 API failed, using default study plan...`)
      return getDefaultStudyPlan(topic)
    }

    const studyPlan = parseStudyPlanFromResponse(response, topic)
    console.log(`✅ Generated ${studyPlan.length} study plan steps`)

    return studyPlan.length > 0 ? studyPlan : getDefaultStudyPlan(topic)
  } catch (error) {
    console.error("❌ Error generating study plan:", error)
    return getDefaultStudyPlan(topic)
  }
}

export async function askQuestion(topic: string, question: string): Promise<string> {
  try {
    console.log(`🎯 Answering question about ${topic}: ${question}`)
    const prompt = `Question about ${topic}: ${question} Answer:`

    let response: string
    try {
      response = await generateTextWithHF(prompt)
    } catch (error) {
      console.log(`🔄 API failed, using default answer...`)
      return `Here's what I can tell you about ${topic}: ${getDefaultExplanation(topic).substring(0, 200)}...`
    }

    const cleanResponse = response
      .replace(/^Answer:\s*/i, "")
      .replace(/^Question.*?\n/i, "")
      .trim()

    console.log(`✅ Generated answer: ${cleanResponse.substring(0, 100)}...`)

    return (
      cleanResponse || `Here's what I can tell you about ${topic}: ${getDefaultExplanation(topic).substring(0, 200)}...`
    )
  } catch (error) {
    console.error("❌ Error answering question:", error)
    return `I'm having trouble answering your question about "${topic}" right now. Please try rephrasing your question or try again in a moment.`
  }
}

// Parser functions (simplified for better reliability)
function parseFlashcards(text: string, topic: string): Array<{ question: string; answer: string }> {
  const flashcards: Array<{ question: string; answer: string }> = []

  // Create flashcards from the generated text
  const sentences = text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10)

  // Create Q&A pairs from the content
  if (sentences.length > 0) {
    flashcards.push({
      question: `What is ${topic}?`,
      answer: sentences[0],
    })
  }

  if (sentences.length > 1) {
    flashcards.push({
      question: `Tell me more about ${topic}`,
      answer: sentences[1],
    })
  }

  // Add more flashcards based on the content
  for (let i = 2; i < Math.min(6, sentences.length); i++) {
    flashcards.push({
      question: `What should I know about ${topic}?`,
      answer: sentences[i],
    })
  }

  return flashcards.length > 0 ? flashcards : getDefaultFlashcards(topic)
}

function parseStudyPlanFromResponse(
  text: string,
  topic: string,
): Array<{
  step: number
  title: string
  description: string
  duration: string
}> {
  const studyPlan: Array<{
    step: number
    title: string
    description: string
    duration: string
  }> = []

  const sentences = text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 15)

  for (let i = 0; i < Math.min(5, sentences.length); i++) {
    studyPlan.push({
      step: i + 1,
      title: `Step ${i + 1}: ${sentences[i].substring(0, 40)}...`,
      description: sentences[i],
      duration: `${i + 2}-${i + 3} days`,
    })
  }

  return studyPlan.length > 0 ? studyPlan : getDefaultStudyPlan(topic)
}

// Enhanced fallback functions with rich content
function getDefaultExplanation(topic: string): string {
  return `${topic} is an important and fascinating subject that encompasses several key concepts and principles. 

Understanding ${topic} involves learning about its fundamental components and how they work together to create the overall system or concept. This topic has significant relevance in various fields and applications.

Key aspects of ${topic} include:
• Core principles and mechanisms that define how it works
• Practical applications and real-world examples where it's used
• Historical development and how our understanding has evolved
• Connections to related concepts and interdisciplinary fields
• Current research and future developments in the area

To master ${topic}, it's recommended to start with the basic definitions and gradually build understanding of more complex aspects. Regular practice and application of concepts will help solidify your knowledge.

${topic} continues to be an active area of study and development, with new discoveries and applications emerging regularly. Whether you're a beginner or looking to deepen your understanding, approaching this topic systematically will yield the best results.`
}

function getDefaultFlashcards(topic: string): Array<{ question: string; answer: string }> {
  return [
    {
      question: `What is the basic definition of ${topic}?`,
      answer: `${topic} is a fundamental concept that encompasses key principles and mechanisms in this area of study.`,
    },
    {
      question: `Why is ${topic} important to understand?`,
      answer: `Understanding ${topic} provides insights into key principles and has practical applications in various fields.`,
    },
    {
      question: `What are the main components of ${topic}?`,
      answer: `The main components include core elements that work together systematically to produce characteristic effects.`,
    },
    {
      question: `How is ${topic} applied in real-world situations?`,
      answer: `${topic} has practical applications across various fields and can be observed in everyday situations and processes.`,
    },
    {
      question: `What should beginners focus on when learning ${topic}?`,
      answer: `Beginners should start with fundamental definitions, core principles, and gradually build understanding through examples.`,
    },
    {
      question: `How can you deepen your understanding of ${topic}?`,
      answer: `Deepen understanding through practice, real-world applications, and connecting concepts to related fields.`,
    },
  ]
}

function getDefaultQuiz(topic: string): Array<{
  question: string
  options: string[]
  correctAnswer: number
  explanation?: string
}> {
  return [
    {
      question: `What is the best approach for learning ${topic}?`,
      options: [
        "Start with the most complex concepts first",
        "Build understanding gradually from basics to advanced",
        "Focus only on memorizing facts and definitions",
        "Skip foundational concepts and jump to applications",
      ],
      correctAnswer: 1,
      explanation:
        "Building understanding gradually from basic concepts to advanced topics ensures a solid foundation and better retention.",
    },
    {
      question: `Which is most important when studying ${topic}?`,
      options: [
        "Memorizing all technical terminology",
        "Understanding the underlying principles and concepts",
        "Focusing only on the most recent developments",
        "Avoiding practical applications",
      ],
      correctAnswer: 1,
      explanation:
        "Understanding underlying principles provides the foundation for grasping more complex aspects and applications.",
    },
    {
      question: `How does ${topic} relate to real-world applications?`,
      options: [
        "It has no practical applications",
        "It only applies in laboratory or academic settings",
        "It has wide-ranging practical applications across various fields",
        "It only applies to theoretical research",
      ],
      correctAnswer: 2,
      explanation: `${topic} typically has numerous practical applications that can be observed and utilized in various real-world contexts.`,
    },
    {
      question: `What makes ${topic} an important area of study?`,
      options: [
        "It's only important for academic purposes",
        "It provides insights into fundamental principles with broad applications",
        "It's a completely isolated field with no connections",
        "It's only relevant to historical understanding",
      ],
      correctAnswer: 1,
      explanation: `${topic} is important because it provides fundamental insights that have broad applications and connections to other fields.`,
    },
  ]
}

function getDefaultStudyPlan(topic: string): Array<{
  step: number
  title: string
  description: string
  duration: string
}> {
  return [
    {
      step: 1,
      title: `Introduction to ${topic}`,
      description: `Start with basic definitions and core concepts. Understand what ${topic} is, why it's important, and its main characteristics. Get familiar with key terminology and fundamental principles.`,
      duration: "1-2 days",
    },
    {
      step: 2,
      title: "Fundamental Principles",
      description: `Learn the key principles and mechanisms that govern ${topic}. Focus on understanding rather than memorization. Study how different components interact and work together.`,
      duration: "2-3 days",
    },
    {
      step: 3,
      title: "Components and Structure",
      description: `Study the main components and how they interact with each other to create the overall system or concept. Analyze the relationships and dependencies between different parts.`,
      duration: "2-3 days",
    },
    {
      step: 4,
      title: "Real-world Applications",
      description: `Explore practical applications and examples of ${topic} in various fields and everyday situations. See how theoretical knowledge translates to practical use cases.`,
      duration: "2-3 days",
    },
    {
      step: 5,
      title: "Advanced Concepts and Review",
      description: `Dive deeper into complex aspects, review all previous material, and test your understanding with practice exercises. Connect advanced concepts to foundational knowledge.`,
      duration: "3-4 days",
    },
  ]
}
