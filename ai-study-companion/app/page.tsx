"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  BookOpen,
  Brain,
  MessageSquare,
  MapPin,
  Lightbulb,
  Loader2,
  GraduationCap,
  Sparkles,
  Target,
  Clock,
  CheckCircle,
  HelpCircle,
} from "lucide-react"
import { generateExplanation, generateFlashcards, generateQuiz, generateStudyPlan, askQuestion } from "./actions"
import { APIStatus } from "@/components/api-status"

interface Flashcard {
  question: string
  answer: string
}

interface QuizQuestion {
  question: string
  options: string[]
  correctAnswer: number
  explanation?: string
}

interface StudyStep {
  step: number
  title: string
  description: string
  duration: string
}

export default function AIStudyCompanion() {
  const [topic, setTopic] = useState("")
  const [explanation, setExplanation] = useState("")
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [quiz, setQuiz] = useState<QuizQuestion[]>([])
  const [studyPlan, setStudyPlan] = useState<StudyStep[]>([])
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([])
  const [currentQuestion, setCurrentQuestion] = useState("")
  const [loading, setLoading] = useState<string | null>(null)
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({})
  const [showResults, setShowResults] = useState(false)
  const [flippedCards, setFlippedCards] = useState<{ [key: number]: boolean }>({})

  const handleGenerateContent = async () => {
    if (!topic.trim()) return

    setLoading("all")
    setExplanation("")
    setFlashcards([])
    setQuiz([])
    setStudyPlan([])
    setSelectedAnswers({})
    setShowResults(false)
    setFlippedCards({})

    try {
      // Generate all content in parallel
      const [explanationResult, flashcardsResult, quizResult, studyPlanResult] = await Promise.all([
        generateExplanation(topic),
        generateFlashcards(topic),
        generateQuiz(topic),
        generateStudyPlan(topic),
      ])

      setExplanation(explanationResult)
      setFlashcards(flashcardsResult)
      setQuiz(quizResult)
      setStudyPlan(studyPlanResult)
    } catch (error) {
      console.error("Error generating content:", error)
    } finally {
      setLoading(null)
    }
  }

  const handleAskQuestion = async () => {
    if (!currentQuestion.trim() || !topic.trim()) return

    setLoading("chat")
    const newMessages = [...chatMessages, { role: "user" as const, content: currentQuestion }]
    setChatMessages(newMessages)

    try {
      const answer = await askQuestion(topic, currentQuestion)
      setChatMessages([...newMessages, { role: "assistant" as const, content: answer }])
    } catch (error) {
      console.error("Error asking question:", error)
      setChatMessages([
        ...newMessages,
        {
          role: "assistant" as const,
          content: "I'm sorry, I'm having trouble processing your question right now. Please try again in a moment.",
        },
      ])
    } finally {
      setLoading(null)
      setCurrentQuestion("")
    }
  }

  const handleQuizSubmit = () => {
    setShowResults(true)
  }

  const calculateScore = () => {
    let correct = 0
    quiz.forEach((q, index) => {
      if (selectedAnswers[index] === q.correctAnswer) {
        correct++
      }
    })
    return { correct, total: quiz.length, percentage: Math.round((correct / quiz.length) * 100) }
  }

  const flipCard = (index: number) => {
    setFlippedCards((prev) => ({ ...prev, [index]: !prev[index] }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-6xl mx-auto px-4 py-16">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                <GraduationCap className="h-10 w-10" />
              </div>
              <h1 className="text-5xl font-bold">AI Study Companion</h1>
              <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                <Sparkles className="h-10 w-10" />
              </div>
            </div>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Transform any topic into a complete learning experience with AI-powered explanations, interactive
              flashcards, personalized quizzes, and smart study plans. Your intelligent study partner is here to help
              you master any subject.
            </p>
            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-blue-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>Powered by Google Flan-T5</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>100% Free to Use</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>No Sign-up Required</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* API Status Monitor */}
      <APIStatus />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* API Status Alert */}
        <Alert className="mb-8 border-blue-200 bg-blue-50">
          <Brain className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>🚀 Ready to Learn!</strong> This app uses HuggingFace's Google Flan-T5-Large model for AI-powered
            content generation. All features are fully functional and free to use.
          </AlertDescription>
        </Alert>

        {/* Topic Input Section */}
        <Card className="mb-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-3 text-xl">
              <Target className="h-6 w-6" />
              What would you like to learn today?
            </CardTitle>
            <CardDescription className="text-indigo-100">
              Enter any topic, concept, or subject - from science and history to programming and literature
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Input
                  placeholder="e.g., Photosynthesis, Machine Learning, Ancient Rome, Quantum Physics..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleGenerateContent()}
                  className="text-lg py-3 pl-4 pr-12 border-2 border-indigo-200 focus:border-indigo-500 rounded-lg"
                />
                <Lightbulb className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-indigo-400" />
              </div>
              <Button
                onClick={handleGenerateContent}
                disabled={!topic.trim() || loading === "all"}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3 text-lg font-semibold rounded-lg shadow-lg transition-all duration-200"
              >
                {loading === "all" ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Generating Magic...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Generate Study Materials
                  </>
                )}
              </Button>
            </div>

            {/* Quick Topic Suggestions */}
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">💡 Popular topics to try:</p>
              <div className="flex flex-wrap gap-2">
                {["Photosynthesis", "Binary Search", "World War II", "Machine Learning", "Shakespeare"].map(
                  (suggestion) => (
                    <Button
                      key={suggestion}
                      variant="outline"
                      size="sm"
                      onClick={() => setTopic(suggestion)}
                      className="text-xs hover:bg-indigo-50 hover:border-indigo-300"
                    >
                      {suggestion}
                    </Button>
                  ),
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Tabs */}
        {(explanation || flashcards.length > 0 || quiz.length > 0 || studyPlan.length > 0) && (
          <Tabs defaultValue="explanation" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 bg-white/80 backdrop-blur-sm p-1 rounded-xl shadow-lg">
              <TabsTrigger
                value="explanation"
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white rounded-lg"
              >
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Explanation</span>
              </TabsTrigger>
              <TabsTrigger
                value="flashcards"
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white rounded-lg"
              >
                <Brain className="h-4 w-4" />
                <span className="hidden sm:inline">Flashcards</span>
              </TabsTrigger>
              <TabsTrigger
                value="quiz"
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white rounded-lg"
              >
                <HelpCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Quiz</span>
              </TabsTrigger>
              <TabsTrigger
                value="chat"
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-600 data-[state=active]:text-white rounded-lg"
              >
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Ask AI</span>
              </TabsTrigger>
              <TabsTrigger
                value="study-plan"
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white rounded-lg"
              >
                <MapPin className="h-4 w-4" />
                <span className="hidden sm:inline">Study Plan</span>
              </TabsTrigger>
            </TabsList>

            {/* Explanation Tab */}
            <TabsContent value="explanation">
              <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-3">
                    <BookOpen className="h-6 w-6" />
                    Understanding {topic}
                  </CardTitle>
                  <CardDescription className="text-blue-100">
                    A comprehensive, beginner-friendly explanation
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  {explanation ? (
                    <div className="prose max-w-none">
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border-l-4 border-blue-500">
                        <p className="text-gray-800 leading-relaxed text-lg whitespace-pre-wrap">{explanation}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 italic text-lg">Generate content to see a detailed explanation</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Flashcards Tab */}
            <TabsContent value="flashcards">
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Interactive Flashcards</h3>
                  <p className="text-gray-600">Click on any card to flip it and reveal the answer</p>
                </div>
                {flashcards.length > 0 ? (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {flashcards.map((card, index) => (
                      <Card
                        key={index}
                        className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl min-h-[220px] bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 hover:border-purple-400"
                        onClick={() => flipCard(index)}
                      >
                        <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
                          <Badge className={`mb-4 ${flippedCards[index] ? "bg-green-500" : "bg-purple-500"}`}>
                            {flippedCards[index] ? "Answer" : "Question"} {index + 1}
                          </Badge>
                          <div className="flex-1 flex items-center justify-center">
                            <p className="text-lg font-medium text-gray-800 leading-relaxed">
                              {flippedCards[index] ? card.answer : card.question}
                            </p>
                          </div>
                          <p className="text-sm text-gray-500 mt-4 flex items-center gap-1">
                            <Brain className="h-4 w-4" />
                            Click to {flippedCards[index] ? "see question" : "reveal answer"}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="shadow-lg">
                    <CardContent className="p-12 text-center">
                      <Brain className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 italic text-lg">Generate content to see interactive flashcards</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Quiz Tab */}
            <TabsContent value="quiz">
              <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-3">
                    <HelpCircle className="h-6 w-6" />
                    Knowledge Quiz
                  </CardTitle>
                  <CardDescription className="text-green-100">
                    Test your understanding of {topic} with these questions
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  {quiz.length > 0 ? (
                    <div className="space-y-8">
                      {quiz.map((question, qIndex) => (
                        <div
                          key={qIndex}
                          className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200"
                        >
                          <h4 className="font-bold text-xl mb-4 text-gray-800">
                            {qIndex + 1}. {question.question}
                          </h4>
                          <div className="space-y-3">
                            {question.options.map((option, oIndex) => (
                              <label
                                key={oIndex}
                                className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-white/50 transition-colors"
                              >
                                <input
                                  type="radio"
                                  name={`question-${qIndex}`}
                                  value={oIndex}
                                  onChange={() => setSelectedAnswers((prev) => ({ ...prev, [qIndex]: oIndex }))}
                                  disabled={showResults}
                                  className="text-green-600 scale-125"
                                />
                                <span
                                  className={`text-lg ${
                                    showResults
                                      ? oIndex === question.correctAnswer
                                        ? "text-green-700 font-bold bg-green-100 px-2 py-1 rounded"
                                        : selectedAnswers[qIndex] === oIndex
                                          ? "text-red-600 line-through"
                                          : "text-gray-700"
                                      : "text-gray-700"
                                  }`}
                                >
                                  {option}
                                </span>
                                {showResults && oIndex === question.correctAnswer && (
                                  <CheckCircle className="h-5 w-5 text-green-600" />
                                )}
                              </label>
                            ))}
                          </div>
                          {showResults && question.explanation && (
                            <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                              <p className="text-blue-800">
                                <strong>💡 Explanation:</strong> {question.explanation}
                              </p>
                            </div>
                          )}
                          {qIndex < quiz.length - 1 && <Separator className="mt-6" />}
                        </div>
                      ))}

                      {!showResults ? (
                        <Button
                          onClick={handleQuizSubmit}
                          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4 text-lg font-semibold rounded-lg shadow-lg"
                          disabled={Object.keys(selectedAnswers).length !== quiz.length}
                        >
                          <CheckCircle className="h-5 w-5 mr-2" />
                          Submit Quiz
                        </Button>
                      ) : (
                        <div className="text-center p-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                          <div className="mb-4">
                            {calculateScore().percentage >= 80 ? (
                              <div className="text-6xl mb-2">🎉</div>
                            ) : calculateScore().percentage >= 60 ? (
                              <div className="text-6xl mb-2">👍</div>
                            ) : (
                              <div className="text-6xl mb-2">📚</div>
                            )}
                          </div>
                          <h3 className="text-3xl font-bold text-green-800 mb-2">Quiz Complete!</h3>
                          <p className="text-xl text-green-700 mb-4">
                            You scored {calculateScore().correct} out of {calculateScore().total} (
                            {calculateScore().percentage}%)
                          </p>
                          <Button
                            onClick={() => {
                              setShowResults(false)
                              setSelectedAnswers({})
                            }}
                            variant="outline"
                            className="border-green-500 text-green-700 hover:bg-green-50"
                          >
                            🔄 Retake Quiz
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <HelpCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 italic text-lg">Generate content to see quiz questions</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Chat Tab */}
            <TabsContent value="chat">
              <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-3">
                    <MessageSquare className="h-6 w-6" />
                    Ask AI About {topic}
                  </CardTitle>
                  <CardDescription className="text-orange-100">
                    Get instant answers to your follow-up questions
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Chat Messages */}
                    <div className="h-80 overflow-y-auto border-2 border-orange-200 rounded-lg p-4 space-y-4 bg-gradient-to-b from-orange-50 to-red-50">
                      {chatMessages.length === 0 ? (
                        <div className="text-center py-16">
                          <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500 italic text-lg">
                            Start by asking a question about {topic || "your topic"}
                          </p>
                          <p className="text-sm text-gray-400 mt-2">
                            Try: "Can you explain this in simpler terms?" or "What are some examples?"
                          </p>
                        </div>
                      ) : (
                        chatMessages.map((message, index) => (
                          <div
                            key={index}
                            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[80%] p-4 rounded-lg shadow-md ${
                                message.role === "user"
                                  ? "bg-gradient-to-r from-orange-500 to-red-600 text-white"
                                  : "bg-white text-gray-800 border border-gray-200"
                              }`}
                            >
                              <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Question Input */}
                    <div className="flex gap-3">
                      <Input
                        placeholder="Ask a question about the topic..."
                        value={currentQuestion}
                        onChange={(e) => setCurrentQuestion(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleAskQuestion()}
                        disabled={!topic.trim()}
                        className="flex-1 border-2 border-orange-200 focus:border-orange-500"
                      />
                      <Button
                        onClick={handleAskQuestion}
                        disabled={!currentQuestion.trim() || !topic.trim() || loading === "chat"}
                        className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 px-6"
                      >
                        {loading === "chat" ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Ask
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Study Plan Tab */}
            <TabsContent value="study-plan">
              <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-3">
                    <MapPin className="h-6 w-6" />
                    Personalized Study Plan
                  </CardTitle>
                  <CardDescription className="text-teal-100">A structured roadmap to master {topic}</CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  {studyPlan.length > 0 ? (
                    <div className="space-y-6">
                      {studyPlan.map((step, index) => (
                        <div
                          key={index}
                          className="flex gap-6 p-6 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg border border-teal-200 hover:shadow-md transition-shadow"
                        >
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                              {step.step}
                            </div>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-xl mb-2 text-gray-800">{step.title}</h4>
                            <p className="text-gray-700 mb-3 leading-relaxed">{step.description}</p>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-teal-600" />
                              <Badge variant="secondary" className="bg-teal-100 text-teal-800 border-teal-300">
                                {step.duration}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="text-center mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                        <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
                        <h4 className="font-bold text-lg text-green-800 mb-2">Ready to Start Learning?</h4>
                        <p className="text-green-700">
                          Follow this plan step by step for the best learning experience!
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 italic text-lg">
                        Generate content to see your personalized study plan
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* Footer */}
        <div className="text-center mt-16 py-8 border-t border-gray-200">
          <div className="flex items-center justify-center gap-2 mb-4">
            <GraduationCap className="h-6 w-6 text-indigo-600" />
            <span className="text-lg font-semibold text-gray-700">AI Study Companion</span>
          </div>
          <p className="text-gray-500">Powered by HuggingFace Google Flan-T5-Large • Made with ❤️ by M.Imtiaz</p>
          <p className="text-sm text-gray-400 mt-2">
            © 2024 All rights reserved • Free to use for educational purposes
          </p>
        </div>
      </div>
    </div>
  )
}
