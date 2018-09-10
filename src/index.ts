require('dotenv').config()

import { google } from 'googleapis'
import { startOfToday, endOfToday } from 'date-fns'

async function run()
{
  let auth = new google.auth.JWT(
    process.env.CLIENT_EMAIL,
    null,
    process.env.CLIENT_PRIVATE_KEY,
    ['https://www.googleapis.com/auth/calendar']
  )

  await auth.authorize()

  let calendar = google.calendar('v3')

  // Get list of source events
  let sourceEvents = await calendar.events.list({ 
    auth, 
    calendarId: 'craig.morris@digitalrisks.co.uk',
    timeMin: startOfToday().toISOString(),
    timeMax: endOfToday().toISOString(),
  })

  // Delete events in destination calendar
  let currentEvents = await calendar.events.list({ 
    auth, 
    calendarId: 'f6i5lp0mpos0r6icfmibfmgusc@group.calendar.google.com',
    timeMin: startOfToday().toISOString(),
    timeMax: endOfToday().toISOString(),
  })
}

run()