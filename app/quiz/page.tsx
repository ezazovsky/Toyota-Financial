'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react'
import Link from 'next/link'

interface Question {
  id: number
  question: string
  options: {
    value: string
    label: string
    points: { lease: number; finance: number }
  }[]
}

const questions: Question[] = [
  {
    id: 1,
    question: "How long do you typically keep a car?",
    options: [
      { value: "2-3", label: "2-3 years", points: { lease: 3, finance: 0 } },
      { value: "3-5", label: "3-5 years", points: { lease: 2, finance: 1 } },
      { value: "5-7", label: "5-7 years", points: { lease: 0, finance: 2 } },
      { value: "7+", label: "7+ years", points: { lease: 0, finance: 3 } }
    ]
  },
  {
    id: 2,
    question: "What's your average annual mileage?",
    options: [
      { value: "under-10k", label: "Under 10,000 miles", points: { lease: 3, finance: 1 } },
      { value: "10k-15k", label: "10,000-15,000 miles", points: { lease: 2, finance: 2 } },
      { value: "15k-20k", label: "15,000-20,000 miles", points: { lease: 1, finance: 2 } },
      { value: "over-20k", label: "Over 20,000 miles", points: { lease: 0, finance: 3 } }
    ]
  },
  {
    id: 3,
    question: "How important is having the latest technology and features?",
    options: [
      { value: "very", label: "Very important", points: { lease: 3, finance: 1 } },
      { value: "somewhat", label: "Somewhat important", points: { lease: 2, finance: 2 } },
      { value: "not-very", label: "Not very important", points: { lease: 1, finance: 2 } },
      { value: "not-at-all", label: "Not important at all", points: { lease: 0, finance: 3 } }
    ]
  },
  {
    id: 4,
    question: "What's your preference for monthly payments?",
    options: [
      { value: "lower", label: "I prefer lower monthly payments", points: { lease: 3, finance: 1 } },
      { value: "moderate", label: "I'm okay with moderate payments", points: { lease: 2, finance: 2 } },
      { value: "higher", label: "I can handle higher payments for ownership", points: { lease: 1, finance: 3 } },
      { value: "no-preference", label: "No strong preference", points: { lease: 1, finance: 1 } }
    ]
  },
  {
    id: 5,
    question: "How do you feel about vehicle maintenance and repairs?",
    options: [
      { value: "avoid", label: "I prefer to avoid unexpected costs", points: { lease: 3, finance: 1 } },
      { value: "some", label: "I don't mind some maintenance costs", points: { lease: 2, finance: 2 } },
      { value: "comfortable", label: "I'm comfortable with maintenance", points: { lease: 1, finance: 2 } },
      { value: "diy", label: "I enjoy working on cars myself", points: { lease: 0, finance: 3 } }
    ]
  },
  {
    id: 6,
    question: "What's most important to you?",
    options: [
      { value: "always-new", label: "Always driving a new car", points: { lease: 3, finance: 0 } },
      { value: "building-equity", label: "Building equity/ownership", points: { lease: 0, finance: 3 } },
      { value: "flexibility", label: "Flexibility to change cars", points: { lease: 2, finance: 1 } },
      { value: "long-term-value", label: "Long-term value", points: { lease: 1, finance: 3 } }
    ]
  }
]

export default function QuizPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [showResult, setShowResult] = useState(false)
  const [result, setResult] = useState<{ recommendation: string; score: { lease: number; finance: number } } | null>(null)

  const handleAnswerChange = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questions[currentQuestion].id]: value
    }))
  }

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
    } else {
      calculateResult()
    }
  }

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1)
    }
  }

  const calculateResult = () => {
    let leaseScore = 0
    let financeScore = 0

    questions.forEach(question => {
      const answer = answers[question.id]
      if (answer) {
        const option = question.options.find(opt => opt.value === answer)
        if (option) {
          leaseScore += option.points.lease
          financeScore += option.points.finance
        }
      }
    })

    const recommendation = leaseScore > financeScore ? 'lease' : 'finance'
    setResult({
      recommendation,
      score: { lease: leaseScore, finance: financeScore }
    })
    setShowResult(true)
  }

  const restartQuiz = () => {
    setCurrentQuestion(0)
    setAnswers({})
    setShowResult(false)
    setResult(null)
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100

  if (showResult && result) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center text-red-600 hover:text-red-700 mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Quiz Results</h1>
          </div>

          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">
                We recommend: {result.recommendation === 'lease' ? 'Leasing' : 'Financing'}
              </CardTitle>
              <CardDescription>
                Based on your answers, {result.recommendation === 'lease' ? 'leasing' : 'financing'} appears to be the better option for your situation.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{result.score.lease}</div>
                  <div className="text-sm text-blue-600">Lease Score</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{result.score.finance}</div>
                  <div className="text-sm text-green-600">Finance Score</div>
                </div>
              </div>

              {result.recommendation === 'lease' ? (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">Why Leasing Might Be Right for You:</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Lower monthly payments</li>
                    <li>• Always drive a newer car with latest features</li>
                    <li>• Covered by warranty for most repairs</li>
                    <li>• No need to worry about depreciation</li>
                    <li>• Easy to switch to a new car every 2-3 years</li>
                  </ul>
                </div>
              ) : (
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-2">Why Financing Might Be Right for You:</h3>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• Build equity and eventual ownership</li>
                    <li>• No mileage restrictions</li>
                    <li>• Freedom to modify your vehicle</li>
                    <li>• Better long-term value</li>
                    <li>• No early termination fees</li>
                  </ul>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={restartQuiz} variant="outline" className="flex-1">
                  Retake Quiz
                </Button>
                <Link href="/vehicles" className="flex-1">
                  <Button className="w-full">
                    Browse Vehicles
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center text-red-600 hover:text-red-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Lease or Finance Quiz</h1>
          <p className="text-lg text-gray-600">
            Answer a few questions to help determine the best option for you
          </p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-gray-600">
                Question {currentQuestion + 1} of {questions.length}
              </span>
              <span className="text-sm text-gray-600">
                {Math.round(progress)}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div 
                className="bg-red-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              />
            </div>
            <CardTitle className="text-xl">
              {questions[currentQuestion].question}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {questions[currentQuestion].options.map((option) => (
                <div key={option.value} className="flex items-center space-x-3">
                  <input
                    type="radio"
                    id={option.value}
                    name={`question-${questions[currentQuestion].id}`}
                    value={option.value}
                    checked={answers[questions[currentQuestion].id] === option.value}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                  />
                  <label htmlFor={option.value} className="flex-1 cursor-pointer text-sm font-medium">
                    {option.label}
                  </label>
                </div>
              ))}
            </div>

            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={prevQuestion}
                disabled={currentQuestion === 0}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              <Button
                onClick={nextQuestion}
                disabled={!answers[questions[currentQuestion].id]}
              >
                {currentQuestion === questions.length - 1 ? 'Get Results' : 'Next'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
