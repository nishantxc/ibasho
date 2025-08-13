// app/api/emotional-insights/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseWithUser } from '@/utils/userFromSb'

type Journal = {
    id: string
    user_id: string
    created_at: string
    mood: string | null
    mood_score: number | null
    caption: string | null
}

function startOfWeek(d: Date) {
    const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
    const day = x.getUTCDay()
    const diff = (day + 6) % 7 // Monday start
    x.setUTCDate(x.getUTCDate() - diff)
    return x.toISOString().slice(0, 10)
}

async function groqChat(messages: { role: 'system' | 'user'; content: string }[]) {
    const apiKey = process.env.GROQ_API_KEY
    const model = process.env.GROQ_MODEL || 'llama-3.1-8b-instant'

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ model, messages, temperature: 0.3, max_tokens: 500 }),
    })

    if (!res.ok) {
        throw new Error(`Groq API error ${res.status}: ${await res.text()}`)
    }

    const json = await res.json()
    return json.choices?.[0]?.message?.content ?? ''
}

export async function POST(req: NextRequest) {
    try {
        const { user, supabase } = await getSupabaseWithUser(req)
        const { range = 90 } = await req.json()

        const since = new Date()
        since.setDate(since.getDate() - Math.min(range, 365))

        const { data, error } = await supabase
            .from('journal_entry')
            .select('id, user_id, created_at, mood, mood_score, caption')
            .eq('user_id', user.id)
            .gte('created_at', since.toISOString())
            .order('created_at', { ascending: true })

        if (error) throw error

        const journals: Journal[] = data || []

        // Also compute total journal entries count for this user
        const { count: totalCount, error: countError } = await supabase
            .from('journal_entry')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)

        if (countError) throw countError

        // Aggregate weekly trend using mood_score directly
        const buckets = new Map<string, { date: string; n: number; scoreSum: number }>()
        for (const j of journals) {
            const weekKey = startOfWeek(new Date(j.created_at))
            const b = buckets.get(weekKey) || { date: weekKey, n: 0, scoreSum: 0 }
            b.n += 1
            b.scoreSum += j.mood_score ?? 0
            buckets.set(weekKey, b)
        }

        const trend = Array.from(buckets.values())
            .sort((a, b) => a.date.localeCompare(b.date))
            .map(b => ({
                week: b.date,
                avgScore: +(b.scoreSum / b.n).toFixed(2),
            }))

        // Prepare recent entries for AI context
        const sampleEntries = journals.slice(-10).map(j => ({
            date: j.created_at.slice(0, 10),
            mood: j.mood,
            score: j.mood_score,
            caption: j.caption?.slice(0, 200),
        }))

        const sysPrompt = `
        You are Ibasho AI, a warm emotional guide.
        Given the user's past week of journal data, return a JSON object ONLY in the following format:
        
        {
          "weekLabel": "Week ## • Aug X–Y",
          "archetype": { "name": "...", "description": "...", "rarityPct": <number> },
          "moodScore": <0-100>,
          "weekSummary": "...",
          "insights": [
            { "metric": "Calm", "value": <0-100>, "rank": "..." },
            { "metric": "Joy", "value": <0-100>, "rank": "..." },
            { "metric": "Resilience", "value": <0-100>, "rank": "..." }
          ],
          "personalNote": "...",
          "theme": {
            "bg": "CSS background value",
            "card": "CSS class or style for card"
          }
        }
        
        Rules:
        - Fill all fields; do not include extra commentary.
        - Use gentle, poetic language that matches Ibasho's tone.
        - The archetype should reflect the dominant emotional pattern of the week.
        - Choose theme colors to match the emotional tone and the archtype colour theme.
        - All numeric scores are 0–100 integers.
        `

        const userPrompt = `
        Weekly trend:
        ${trend.map(t => `${t.week}: ${t.avgScore}`).join('\n')}
        

Recent entries:
${JSON.stringify(sampleEntries, null, 2)}`

        const narrative = await groqChat([
            { role: 'system', content: sysPrompt },
            { role: 'user', content: userPrompt },
        ])

        // narrative should be a JSON string at this point; sanitize and parse robustly
        function stripCommentsAndTrailingCommas(input: string) {
            // Remove // line comments
            let cleaned = input.replace(/(^|\s)\/\/.*$/gm, '')
            // Remove /* */ block comments
            cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, '')
            // Remove trailing commas in objects/arrays
            cleaned = cleaned.replace(/,\s*([}\]])/g, '$1')
            return cleaned
        }

        function extractFirstJsonBlock(input: string) {
            const start = input.indexOf('{')
            const end = input.lastIndexOf('}')
            if (start === -1 || end === -1 || end <= start) return input
            return input.slice(start, end + 1)
        }

        let payload
        try {
            const raw = extractFirstJsonBlock(narrative)
            const cleaned = stripCommentsAndTrailingCommas(raw)
            payload = JSON.parse(cleaned)
        } catch (e) {
            console.error('Invalid JSON from LLM:', narrative)
            throw new Error('LLM did not return valid JSON')
        }

        // Build response compatible with client expectations
        const responseBody = {
            trend,
            narrative: payload?.weekSummary ?? '',
            summary: payload,
            journalCount: typeof totalCount === 'number' ? totalCount : journals.length,
        }

        return NextResponse.json(responseBody)
    } catch (e: any) {
        console.error(e)
        return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 })
    }
}
