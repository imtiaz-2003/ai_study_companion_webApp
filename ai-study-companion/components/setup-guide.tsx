"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ExternalLink, Key, CheckCircle } from "lucide-react"

export function SetupGuide() {
  const [showGuide, setShowGuide] = useState(false)

  return (
    <div className="mb-6">
      <Alert>
        <Key className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>This app uses HuggingFace AI models. Setup required for full functionality.</span>
          <Button variant="outline" size="sm" onClick={() => setShowGuide(!showGuide)}>
            {showGuide ? "Hide" : "Show"} Setup Guide
          </Button>
        </AlertDescription>
      </Alert>

      {showGuide && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              HuggingFace API Setup
            </CardTitle>
            <CardDescription>
              Follow these steps to enable AI-powered content generation (completely free!)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                  1
                </div>
                <div>
                  <p className="font-medium">Create a HuggingFace Account</p>
                  <p className="text-sm text-gray-600">
                    Visit{" "}
                    <a
                      href="https://huggingface.co/join"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline inline-flex items-center gap-1"
                    >
                      huggingface.co/join <ExternalLink className="h-3 w-3" />
                    </a>{" "}
                    and create a free account
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                  2
                </div>
                <div>
                  <p className="font-medium">Generate API Token</p>
                  <p className="text-sm text-gray-600">
                    Go to{" "}
                    <a
                      href="https://huggingface.co/settings/tokens"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline inline-flex items-center gap-1"
                    >
                      Settings → Access Tokens <ExternalLink className="h-3 w-3" />
                    </a>{" "}
                    and create a new token
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                  3
                </div>
                <div>
                  <p className="font-medium">Add Environment Variable</p>
                  <p className="text-sm text-gray-600">
                    Add <code className="bg-gray-100 px-1 rounded">HUGGINGFACE_API_KEY=your_token_here</code> to your
                    environment variables
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-600">You're all set!</p>
                  <p className="text-sm text-gray-600">The app will now use real AI models to generate content</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">💡 Pro Tips:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• HuggingFace offers completely free API access</li>
                <li>• No credit card required</li>
                <li>• Rate limits apply but are generous for personal use</li>
                <li>• The app includes fallback content if API limits are reached</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
