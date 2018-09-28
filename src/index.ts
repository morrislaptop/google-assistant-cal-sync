require('dotenv').config()

import { google } from 'googleapis'
import { startOfToday, endOfTomorrow } from 'date-fns'

async function run()
{
  console.log('Starting')

  let auth = new google.auth.JWT(
    process.env.CLIENT_EMAIL,
    null,
    process.env.CLIENT_PRIVATE_KEY,
    ['https://www.googleapis.com/auth/calendar']
  )

  await auth.authorize()

  let calendar = google.calendar('v3')

  // Delete events in destination calendar
  let currentEvents = (await calendar.events.list({ 
    auth, 
    calendarId: 'f6i5lp0mpos0r6icfmibfmgusc@group.calendar.google.com',
    timeMin: startOfToday().toISOString(),
    timeMax: endOfTomorrow().toISOString(),
  })).data.items

  await Promise.all(currentEvents.map(event => {
    console.log(`Deleting existing event: ${event.summary}`)

    return calendar.events.delete({
      auth,
      calendarId: 'f6i5lp0mpos0r6icfmibfmgusc@group.calendar.google.com',
      eventId: event.id,
    })
  }))

  // Get list of source events
  let sourceEvents = (await calendar.events.list({ 
    auth, 
    calendarId: 'craig.morris@digitalrisks.co.uk',
    timeMin: startOfToday().toISOString(),
    timeMax: endOfToday().toISOString(),
  })).data.items

  await Promise.all(sourceEvents.map(event => {
    
    // @todo Maybe include weekly / monthly
    if (event.recurrence) {
      console.log(`Skipping recurring event: ${event.summary}`)
      return
    }

    console.log(`Creating event: ${event.summary}`)

    return calendar.events.insert({
      auth,
      calendarId: 'f6i5lp0mpos0r6icfmibfmgusc@group.calendar.google.com',
      requestBody: {
        summary: event.summary,
        start: event.start,
        end: event.end,
      }
    })
  }))

  console.log('Done')
}

run()