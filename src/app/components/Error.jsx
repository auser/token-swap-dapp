import React from 'react'

export const Error = ({error}) => {
  return (
    <div className="error">
      <h3>An error occurred</h3>
      <p>There was an unexpected error that occurred. Please check the console of your browser (instructions below) and send the log to: <a href="mailto:jeremy@shopin.com">jeremy@shopin.com</a>. We appreciate your patience.</p>
      <p>
        Some common issues for errors might include, but are not limited to the following:</p>
      <ul>
        <li>Not enough gas in the transaction. Try upping the gas and try again</li>again<li>Transaction not confirmed with enough time. Sometimes this happens if the network is overly congested. Please wait a little bit and try again.</li>
        </ul>
        <div className="console instructions">
          In order to check the console errors, we'll need to open the developer console. Depending upon the browser you're using, these instructions will differ.
          <ul>
            <li>Chrome: <a href="https://developers.google.com/web/tools/chrome-devtools/console/" target="_blank">Google Chrome instructions</a></li>
              <li>Internet Explorer: <a href="https://msdn.microsoft.com/en-us/library/dd565625(v=vs.85).aspx" target="_blank">Internet Explorer instructions</a></li>
                <li>Safari: <a href="https://developer.apple.com/safari/tools/" target="_blank">Safari</a></li>
          </ul>
        </div>
    </div>

  )
}

export default Error
