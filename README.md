# Road to 1000

A two-player road race card game based on the French classic **Mille Bornes**, built to play on phones and iPads.

**Play it:** https://bcbarb24.github.io/road-to-1000/

## Playing together (no accounts needed)

1. Both players open the link above on their own device.
2. One player types their name and taps **Host a game**. A 4-letter code appears (for example `KQ7M`).
3. The other player types their name and the code, then taps **Join**.
4. Either player taps **Deal the cards**.

The two devices connect directly to each other ([PeerJS](https://peerjs.com/) / WebRTC), so there's no server or sign-up. Keep the page open while you play. If someone refreshes or loses connection, open the link again and tap **Rejoin** (guest) or **Go back to your game** (host). The host's device holds the game, so the host should avoid clearing their browser data mid-game.

Direct connections work on most home Wi-Fi. Some mobile-data, school and work networks block them; if joining fails, try both devices on Wi-Fi.

## Practice

**Practice vs Robo** plays against a computer opponent on one device, with no connection needed.

## Rules in brief

- Race to exactly **1000 km**. Each turn, draw a card, then play one or throw one away.
- Play **Roll** (green light) before you can drive, then distance cards (25–200 km; max two 200s per hand).
- **Hazards** (Accident, Out of Gas, Flat Tire, Stop, Speed Limit) slow your opponent; **Remedies** fix them.
- **Safeties** give permanent protection and an extra turn. Holding the matching safety when you're attacked lets you call **coup fourré** for a bonus.
- Standard scoring: 1 point per km, 100 per safety, 300 for all four, 300 per coup fourré, 400 for finishing, and bonuses for a delayed action, a safe trip and a shutout. First to 5000 points wins.

## Project

Everything is in a single `index.html`: no build step. To run locally, open the file in a browser or serve the folder (`python3 -m http.server`).

Card artwork is original, drawn in SVG in the style of the classic game.
