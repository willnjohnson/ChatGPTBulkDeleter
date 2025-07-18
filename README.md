# ChatGPT Bulk Deleter

Don't have time to manually delete all of your conversations? This script makes it seamless to delete multiple conversations at once.

### Features
* **Bulk Deletion:** Easily select and delete multiple conversations from a single, convenient modal.
* **Simple Integration:** Adds a "Bulk Delete" button directly to the ChatGPT interface for easy access.
* **Modal View:** Displays your conversations with checkboxes in an organized, scrollable window.

### How to Use

This is a user script, which requires a browser extension like **Tampermonkey** or **Greasemonkey** to run.

1.  **Install a User Script Manager:**
    * For Chrome, Firefox, and other browsers, install [Tampermonkey](https://www.tampermonkey.net/).
    * For Firefox, you can also use [Greasemonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/).

2.  **Install the Script:**
    * Click on the **"Raw"** button on this GitHub page to [view the script's raw code](https://raw.githubusercontent.com/willnjohnson/ChatGPTBulkDeleter/refs/heads/main/chatgpt_bulk_deleter.js).
    * Your user script manager will prompt you to install the script.
    * Confirm the installation.

3.  **Run the Script:**
    * Navigate to `chatgpt.com`.
    * You should see a new **"Bulk Delete"** button in the top right corner of the page.
    * Click the button to open the bulk deletion modal.
    * Select the conversations you want to delete and click **"Delete Checked"** to delete checked items from the list.

### Technical Details
This script operates by making direct API calls to ChatGPT's backend. It fetches an authentication token from your current session to authorize the deletion requests. By setting the `is_visible` flag to `false` in a `PATCH` request, it effectively archives and removes the conversation from your view.

Does it ***really delete*** my conversation? Probably not... OpenAI probably still retains the conversation somewhere on their server.

---

### A Note on Privacy and Security

This script is a client-side tool and only interacts with the ChatGPT domain. It **does not** collect, store, or transmit any of your conversation data. The authentication token is used exclusively to make authorized deletion requests on your behalf and is not shared or saved.

---
### Acknowledgments
* **Author:** [@willnjohnson](https://github.com/willnjohnson)
