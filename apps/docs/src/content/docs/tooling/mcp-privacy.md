---
title: MCP Server — Privacy Policy
description: Privacy policy for the Wire DSL MCP Server (mcp.wire-dsl.org).
---

*Last updated: March 2026*

---

## Overview

Wire DSL is an open-source project. This policy describes how the Wire DSL MCP server (`mcp.wire-dsl.org`) handles data.

The short version: **we do not collect, store, or share personal data.** The MCP server processes your wireframe code in memory and returns a result. Nothing is persisted.

---

## What we process

When you call a tool on the MCP server, the following data is sent to the server:

- **Wire DSL source code** submitted in the `wire_code` parameter
- **Tool parameters** (device, theme, renderer, screen name)

This data is processed in memory to generate the response (documentation text, validation result, or rendered SVG/PNG). It is **not stored, logged, or shared**.

## What we do not do

- We do not store Wire DSL code or tool results
- We do not associate requests with users, accounts, or identifiers
- We do not use cookies or tracking mechanisms
- We do not sell or share data with third parties

## Server logs

The hosting infrastructure may retain standard HTTP access logs (IP address, timestamp, HTTP method, response status) for operational purposes such as abuse prevention and uptime monitoring. These logs are not used for analytics and are retained for no more than 30 days.

---

## Open-source use and self-hosting

The Wire DSL MCP server is open source. If you run your own instance, you are responsible for the data handling within that instance. No data from self-hosted instances is sent to `mcp.wire-dsl.org` or any Wire DSL service.

---

## Changes to this policy

If this policy changes materially, the *Last updated* date at the top of this page will be updated. Continued use of the MCP server after a policy change constitutes acceptance of the updated policy.

---

## Contact

For privacy-related questions, open an issue on the [Wire DSL GitHub repository](https://github.com/wire-dsl/wire-dsl).
