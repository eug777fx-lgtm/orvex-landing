import { neon } from '@neondatabase/serverless'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const connectionString =
    process.env.NEON_DATABASE_URL || process.env.VITE_DATABASE_URL
  if (!connectionString) {
    return res.status(500).json({ error: 'Database not configured' })
  }

  try {
    const body = req.body || {}
    const {
      name = '',
      business_name = '',
      phone = '',
      email = '',
      service_needed = '',
      message = '',
    } = body

    if (!name.trim() || !business_name.trim() || !phone.trim()) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const notesParts = []
    if (message.trim()) notesParts.push(message.trim())
    if (service_needed) notesParts.push(`Needs: ${service_needed}`)
    const notes = notesParts.join(' | ')

    const sql = neon(connectionString)
    await sql.query(
      `INSERT INTO leads (
        company_name, owner_name, phone, email, industry,
        notes, source, status,
        has_website, has_crm, opportunity_score
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, 'landing_page', 'new',
        false, false, 6
      )`,
      [
        business_name.trim(),
        name.trim(),
        phone.trim(),
        email.trim() || null,
        'website inquiry',
        notes || null,
      ],
    )

    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('Booking error:', error)
    return res
      .status(500)
      .json({ error: error?.message || 'Internal server error' })
  }
}
