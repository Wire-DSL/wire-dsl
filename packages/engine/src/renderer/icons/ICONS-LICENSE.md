# Icon Library License

This project includes icons from [Feather Icons](https://feathericons.com) by Cole Bemis and contributors.

## License

Feather Icons are licensed under the **MIT License**.

### MIT License Text

```
MIT License

Copyright (c) 2013-present Cole Bemis and Feather Icons contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Repository

- **Source**: https://github.com/feathericons/feather
- **Website**: https://feathericons.com

## Icons Included

The following icons from Feather Icons are included in this project:

### UI Navigation
- home
- menu
- x
- chevron-right
- chevron-left
- chevron-down
- chevron-up
- arrow-right
- arrow-left
- arrow-down
- arrow-up

### Search & Input
- search
- filter

### Edit & Actions
- edit
- edit-2
- trash
- trash-2
- copy
- download
- upload
- plus
- minus
- check

### Notifications & Status
- bell
- alert-circle
- alert-triangle
- info

### User & Account
- user
- user-check
- user-x
- settings
- log-out
- log-in

### Communication
- mail
- phone
- share
- share-2

### Data & Info
- calendar
- clock
- map-pin
- wifi
- wifi-off

### Media & Visuals
- eye
- eye-off
- image

### Feedback & Social
- heart
- star

### Loading & Misc
- loader
- help-circle

## Usage in Wire-DSL

Icons are used in Wire-DSL by their Feather Icons name:

```wire
component Icon type: "search"
component Icon type: "wifi"
component IconButton icon: "trash-2"
component IconButton icon: "home"
```

For the complete list of available icons, see the `ICON_LIBRARY` object in `iconLibrary.ts`.

## Modifications

The SVG code from Feather Icons has been:
1. Copied and stored as string values in TypeScript
2. Made compatible with Wire-DSL's renderer
3. All original styling preserved (viewBox, stroke attributes, etc.)

No visual modifications have been made to the icons themselves.
