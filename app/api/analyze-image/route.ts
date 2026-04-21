import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 })
  }

  try {
    const body = await request.json()
    const { imageBase64, mimeType = 'image/jpeg' } = body

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = `You are a nutrition expert. Analyze this food image and identify all food items visible.
For each item, estimate nutritional values per 100g.
Respond ONLY with valid JSON in this exact format (no markdown, no explanation):
{
  "foods": [
    {
      "name": "Food Name",
      "estimated_quantity_g": 150,
      "calories_per_100g": 200,
      "protein_g": 5.0,
      "carbs_g": 30.0,
      "fat_g": 8.0,
      "fiber_g": 2.0,
      "confidence": "high"
    }
  ],
  "meal_description": "Brief description of the meal"
}`

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: imageBase64, mimeType } }
    ])

    const text = result.response.text().trim()
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON in response')

    const parsed = JSON.parse(jsonMatch[0])
    return NextResponse.json(parsed)
  } catch (err) {
    console.error('Image analysis error:', err)
    return NextResponse.json({ error: 'Failed to analyze image' }, { status: 500 })
  }
}
