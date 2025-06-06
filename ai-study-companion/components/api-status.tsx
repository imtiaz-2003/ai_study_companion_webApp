"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, AlertTriangle, RefreshCw } from "lucide-react"

export function APIStatus() {
  const [status, setStatus] = useState<"checking" | "online" | "offline" | "error">("checking")
  const [lastChecked, setLastChecked] = useState<Date | null>(null)
  const [errorDetails, setErrorDetails] = useState<string>("")

  const checkAPIStatus = async () => {
    setStatus("checking")
    try {
      console.log("🔍 Testing HuggingFace API connectivity...")

      const response = await fetch("https://api-inference.huggingface.co/models/gpt2", {
        method: "POST",
        headers: {
          Authorization: "Bearer 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",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: "Hello world",
          parameters: { max_new_tokens: 5 },
          options: { wait_for_model: true },
        }),
      })

      console.log(`📡 API Status Check Response: ${response.status}`)

      if (response.ok) {
        const result = await response.json()
        console.log("✅ API Test Result:", result)
        setStatus("online")
        setErrorDetails("")
      } else {
        const errorText = await response.text()
        console.error("❌ API Test Failed:", errorText)
        setStatus("error")
        setErrorDetails(`HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      console.error("❌ API Test Error:", error)
      setStatus("offline")
      setErrorDetails(error instanceof Error ? error.message : "Unknown error")
    }
    setLastChecked(new Date())
  }

  useEffect(() => {
    checkAPIStatus()
  }, [])

  const getStatusIcon = () => {
    switch (status) {
      case "online":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "offline":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "error":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      default:
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case "online":
        return "bg-green-100 text-green-800 border-green-200"
      case "offline":
        return "bg-red-100 text-red-800 border-red-200"
      case "error":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-blue-100 text-blue-800 border-blue-200"
    }
  }

  const getStatusMessage = () => {
    switch (status) {
      case "checking":
        return "🔍 Testing HuggingFace GPT-2 model connectivity..."
      case "online":
        return "✅ HuggingFace API is working correctly with GPT-2 model"
      case "offline":
        return "❌ Cannot connect to HuggingFace API - Check your internet connection"
      case "error":
        return `⚠️ API Error: ${errorDetails}`
      default:
        return "Unknown status"
    }
  }

  return (
    <Alert className={`mb-6 ${getStatusColor()}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <AlertDescription>
            <strong>API Status:</strong> {getStatusMessage()}
            {lastChecked && (
              <span className="text-xs ml-2 block sm:inline">(Last checked: {lastChecked.toLocaleTimeString()})</span>
            )}
          </AlertDescription>
        </div>
        <Button variant="outline" size="sm" onClick={checkAPIStatus} disabled={status === "checking"}>
          <RefreshCw className={`h-3 w-3 mr-1 ${status === "checking" ? "animate-spin" : ""}`} />
          Test API
        </Button>
      </div>
      {status === "error" && (
        <div className="mt-2 text-xs">
          <strong>Troubleshooting:</strong>
          <ul className="list-disc list-inside mt-1">
            <li>Check if your internet connection is working</li>
            <li>The HuggingFace API might be temporarily unavailable</li>
            <li>Try refreshing the page and testing again</li>
            <li>The app will use fallback content if the API is unavailable</li>
          </ul>
        </div>
      )}
    </Alert>
  )
}
