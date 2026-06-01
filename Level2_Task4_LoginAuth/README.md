# AuthKit

A login/register app with a CSS panda mascot that actually reacts to what you do.
No libraries. No images. No SVG. Just HTML, CSS and vanilla JS.

**Live demo:** https://gaurav-o.github.io/OIBSIP/Level2_Task4_LoginAuth/
**GitHub:** https://github.com/gaurav-o/OIBSIP/tree/main/Level2_Task4_LoginAuth

---

## What it does

The panda watches your cursor and reacts to everything — focus a text field
and it looks down, focus the password field and it covers its eyes, submit
a wrong password and it shakes its head. It also chews a little bamboo stick
the whole time which is arguably the best part.

Beyond the mascot, it's a fully working auth flow:

- Register with name, email and password
- Login and get redirected to a welcome screen
- Session persists on refresh via localStorage
- Logout clears the session

---

## Mascot states

| What you do                 | What the panda does |
|---|---|
| Move your mouse             | Head and pupils track the cursor |
| Focus any text field        | Eyes look downward, brows raise |
| Focus the password field    | Covers eyes with both hands |
| Failed validation or wrong
  password         | Shakes head, sad face |
| Successful login or register | Jumps, big smile, rosy cheeks |
| Every 2–4 seconds (idle) | Blinks naturally |

---

## Validation

- Empty field check on all inputs
- Email format check (live as you type)
- Password minimum 6 characters (live counter)
- Duplicate email blocked on register
- Inline error and success messages per field

---

## Stack

HTML · CSS · Vanilla JavaScript — nothing else.
Users stored in localStorage. Zero dependencies. Zero build step.

---