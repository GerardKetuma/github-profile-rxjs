import Rx from 'rxjs/Rx'
import axios from 'axios'

const refreshButton = document.querySelector('.refresh')
const closeButton1 = document.querySelector('.close1')
const closeButton2 = document.querySelector('.close2')
const closeButton3 = document.querySelector('.close3')

const refreshClickStream = Rx.Observable.fromEvent(refreshButton, 'click')
const close1ClickStream = Rx.Observable.fromEvent(closeButton1, 'click')
const close2ClickStream = Rx.Observable.fromEvent(closeButton2, 'click')
const close3ClickStream = Rx.Observable.fromEvent(closeButton3, 'click')

const requestStream = refreshClickStream.startWith('startup click').map(() => {
  const randomOffset = Math.floor(Math.random() * 500)
  return `https://api.github.com/users?since=${randomOffset}`
})

const responseStream = requestStream.mergeMap(requestUrl =>
  Rx.Observable.fromPromise(axios.get(requestUrl)))

const createSuggestionStream = closeStream =>
  closeStream
    .startWith('startup click')
    .combineLatest(
      responseStream,
      (click, response) => response.data[Math.floor(Math.random() * response.data.length)],
    )
    .merge(refreshClickStream.map(() => null))
    .startWith(null)

const suggestion1Stream = createSuggestionStream(close1ClickStream)
const suggestion2Stream = createSuggestionStream(close2ClickStream)
const suggestion3Stream = createSuggestionStream(close3ClickStream)

/* Rendering function */
const renderSuggestion = (suggestedUser, selector) => {
  const suggestionEl = document.querySelector(selector)
  if (suggestedUser === null) {
    suggestionEl.style.visibility = 'hidden'
  } else {
    suggestionEl.style.visibility = 'visible'
    const usernameEl = suggestionEl.querySelector('.username')
    usernameEl.href = suggestedUser.html_url
    usernameEl.textContent = suggestedUser.login
    const imgEl = suggestionEl.querySelector('img')
    imgEl.src = ''
    imgEl.src = suggestedUser.avatar_url
  }
}

suggestion1Stream.subscribe(user => renderSuggestion(user, '.suggestion1'))
suggestion2Stream.subscribe(user => renderSuggestion(user, '.suggestion2'))
suggestion3Stream.subscribe(user => renderSuggestion(user, '.suggestion3'))
