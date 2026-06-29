---
status: testing
phase: 30-authentication-screens-refactoring
source:
  - 30-01-SUMMARY.md
started: 2026-06-29T06:19:35Z
updated: 2026-06-29T06:19:35Z
---

## Current Test

number: 1
name: Split Hero Layout Navigation
expected: |
  Open the login page (/login) or register page (/register) in the browser. You should observe a premium Split Hero Layout with a dark visual Indigo gradient panel on the left (showing Antigravity RAG logo, taglines, and key features list) and a centered card form on the right.
awaiting: user response

## Tests

### 1. Split Hero Layout Navigation
expected: Open the login page (/login) or register page (/register) in the browser. You should observe a premium Split Hero Layout with a dark visual Indigo gradient panel on the left (showing Antigravity RAG logo, taglines, and key features list) and a centered card form on the right.
result: pending

### 2. Login Form Client-Side Validations
expected: Submit empty values or too short credentials (username < 3 chars, password < 6 chars) on the login screen. You should immediately see inline validation helper messages and red warning borders on the fields without any page reload.
result: pending

### 3. Registration Client-Side Validations
expected: Fill the register form with mismatched passwords and submit. You should immediately see a "Passwords do not match" validation warning next to the confirm password field.
result: pending

### 4. Error Handling & Toast Notifications
expected: Attempt to sign in with invalid credentials. You should see a red alert banner at the top of the form AND a Sonner toast notification popping up in the top-right corner.
result: pending

## Summary

total: 4
passed: 0
issues: 0
pending: 4
skipped: 0

## Gaps

[none yet]
