---

**Instructions:**

Your task is to create a basic A/B testing logic using vanilla JavaScript. 

1. First, create a function that retrieves the value of a cookie given its name.
2. Then, use this function to check if a specific cookie, `homepageredirect`, exists and if its value is '1'.
3. If the current URL is the homepage and the `homepageredirect` cookie value is '1', redirect the user to a different homepage (e.g., `/pages/homepagetest`).

**Requirements:**

- You should only use vanilla JavaScript. Do not use any external libraries or frameworks.
- The script should be included in a `<script>` tag in the HTML.
- The script should check the current URL to determine if the user is on the homepage.
- The script should check the value of the `homepageredirect` cookie.
- If the `homepageredirect` cookie is set to '1', and the user is on the homepage, the script should redirect the user to `/pages/homepagetest`.
- Make sure not to create an infinite loop of redirects.

**Hints:**

- You can check the current URL using `window.location.href` and the base URL using `window.location.origin`.
- You can redirect to a different URL using `window.location.href = redirectUrl;`.

**Evaluation Criteria:**

1. **Correctness:** Does the script correctly redirect to the test homepage if the `homepageredirect` cookie is set to '1'?
2. **Code Quality:** Is the code well-organized, easy to read, and well-commented?
3. **Error Handling:** Does the code handle potential errors gracefully?

---

<script>

// ********Write your script file here ********

</script>
