---
name: ticket-methodology
description: Scrum/Kanban ticket creation methodology and governance
metadata: 
  node_type: memory
  type: standard
---

# Ticket Methodology (Kanban/Scrum)

## Core Philosophy
Focus strictly on **WHAT** to deliver, not **HOW**. Implementation paths can be detailed as technical notes, but the title and scope must describe the business or architectural result. 

## Ticket Structure (The Contract)
Every ticket pushed to the board must follow this canonical format:

```markdown
[PREFIX-00] — Title describing the value delivery

**1. Context:** 
Description of the expected behavior and WHY this is being done (linked to VDD).

**2. Acceptance Criteria:**
- [ ] Boolean checklist defining when the ticket is done.
- [ ] No implementation details here.

**3. Technical Scope & Notes:**
*Technology:* (e.g., Leaflet, React Router)
*Impacts:* (Where in the codebase it will touch)
*Depends on:* [PREFIX-XX] (If applicable)