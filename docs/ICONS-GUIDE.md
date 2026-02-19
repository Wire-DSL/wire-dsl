# Icon Components Guide

Wire-DSL includes two icon components powered by **Feather Icons** (MIT License): `Icon` and `IconButton`.

## Overview

Both components use the official Feather Icons library naming convention. All icons are scalable SVG graphics that automatically adapt to their container size and  colors.

## Component: Icon

The `Icon` component renders a simple icon display.

### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `type` | enum | `help-circle` | Icon name from the built-in icon catalog |
| `size` | enum | `md` | Icon size: `sm`, `md`, `lg` |
| `variant` | enum/string | `default` | Color variant (`default`, built-ins, or custom key in `colors`) |

### Usage

```wire
component Icon icon: "home"
component Icon icon: "search"
component Icon icon: "wifi"
component Icon icon: "trash-2"
```

### Example with Layout

```wire
layout stack(direction: horizontal, gap: 12) {
  component Icon icon: "arrow-left"
  component Icon icon: "arrow-right"
  component Icon icon: "arrow-up"
  component Icon icon: "arrow-down"
}
```

## Component: IconButton

The `IconButton` component renders a clickable icon button with background and border styling.

### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `icon` | enum | `help-circle` | Icon name from the built-in icon catalog |
| `size` | enum | `md` | IconButton size: `sm`, `md`, `lg` |
| `variant` | string | `default` | Button style: `default`, `primary`, `secondary`, `success`, `warning`, `danger`, `info` |
| `disabled` | boolean | `false` | Disable the button: `true` or `false` |
| `labelSpace` | boolean | `false` | Adds top label offset to align with labeled form controls |
| `padding` | enum | `none` | Horizontal inset: `none`, `xs`, `sm`, `md`, `lg`, `xl` |

### Variants

- **default**: Neutral background + border
- **primary**: Accent action
- **secondary**: Secondary action
- **success**: Positive action
- **warning**: Caution action
- **danger**: Destructive action
- **info**: Informational action

### Usage

```wire
component IconButton icon: "home" variant: "default"
component IconButton icon: "download" variant: "primary"
component IconButton icon: "share-2" variant: "secondary"
component IconButton icon: "trash-2" variant: "danger"
component IconButton icon: "settings" variant: "default" disabled: true
```

### Disabled Buttons

```wire
layout stack(direction: horizontal, gap: 8) {
  component IconButton icon: "lock" variant: "default" disabled: true
  component IconButton icon: "eye-off" variant: "default" disabled: true
}
```

## Available Icons (287)

Wire-DSL currently bundles **287 icons** from **Feather Icons v4.29.0**.
These names are valid for `Icon.icon`, `IconButton.icon`, `Topbar.icon`, `Image icon` (when `placeholder: "icon"`), and `StatCard.icon`.

In `@wire-dsl/language-support`, the same catalog is exposed as:
- `ICON_NAMES` (typed list)
- `ICON_NAME_OPTIONS` (metadata options for completions)
- `IconName` (TypeScript union type)

### Full list (alphabetical)

```text
activity
airplay
alert-circle
alert-octagon
alert-triangle
align-center
align-justify
align-left
align-right
anchor
aperture
archive
arrow-down
arrow-down-circle
arrow-down-left
arrow-down-right
arrow-left
arrow-left-circle
arrow-right
arrow-right-circle
arrow-up
arrow-up-circle
arrow-up-left
arrow-up-right
at-sign
award
bar-chart
bar-chart-2
battery
battery-charging
bell
bell-off
bluetooth
bold
book
book-open
bookmark
box
briefcase
calendar
camera
camera-off
cast
check
check-circle
check-square
chevron-down
chevron-left
chevron-right
chevron-up
chevrons-down
chevrons-left
chevrons-right
chevrons-up
chrome
circle
clipboard
clock
cloud
cloud-drizzle
cloud-lightning
cloud-off
cloud-rain
cloud-snow
code
codepen
codesandbox
coffee
columns
command
compass
copy
corner-down-left
corner-down-right
corner-left-down
corner-left-up
corner-right-down
corner-right-up
corner-up-left
corner-up-right
cpu
credit-card
crop
crosshair
database
delete
disc
divide
divide-circle
divide-square
dollar-sign
download
download-cloud
dribbble
droplet
edit
edit-2
edit-3
external-link
eye
eye-off
facebook
fast-forward
feather
figma
file
file-minus
file-plus
file-text
film
filter
flag
folder
folder-minus
folder-plus
framer
frown
gift
git-branch
git-commit
git-merge
git-pull-request
github
gitlab
globe
grid
hard-drive
hash
headphones
heart
help-circle
hexagon
home
image
inbox
info
instagram
italic
key
layers
layout
life-buoy
link
link-2
linkedin
list
loader
lock
log-in
log-out
mail
map
map-pin
maximize
maximize-2
meh
menu
message-circle
message-square
mic
mic-off
minimize
minimize-2
minus
minus-circle
minus-square
monitor
moon
more-horizontal
more-vertical
mouse-pointer
move
music
navigation
navigation-2
octagon
package
paperclip
pause
pause-circle
pen-tool
percent
phone
phone-call
phone-forwarded
phone-incoming
phone-missed
phone-off
phone-outgoing
pie-chart
play
play-circle
plus
plus-circle
plus-square
pocket
power
printer
radio
refresh-ccw
refresh-cw
repeat
rewind
rotate-ccw
rotate-cw
rss
save
scissors
search
send
server
settings
share
share-2
shield
shield-off
shopping-bag
shopping-cart
shuffle
sidebar
skip-back
skip-forward
slack
slash
sliders
smartphone
smile
speaker
square
star
stop-circle
sun
sunrise
sunset
table
tablet
tag
target
terminal
thermometer
thumbs-down
thumbs-up
toggle-left
toggle-right
tool
trash
trash-2
trello
trending-down
trending-up
triangle
truck
tv
twitch
twitter
type
umbrella
underline
unlock
upload
upload-cloud
user
user-check
user-minus
user-plus
user-x
users
video
video-off
voicemail
volume
volume-1
volume-2
volume-x
watch
wifi
wifi-off
wind
x
x-circle
x-octagon
x-square
youtube
zap
zap-off
zoom-in
zoom-out
```

## Complete Example

```wire
project "Icon Demo" {
  screen Dashboard {
    layout stack(direction: vertical, gap: 16, padding: 16) {
      component Heading text: "Dashboard Controls"

      // Icons in a horizontal layout
      layout stack(direction: horizontal, gap: 12) {
        component Icon icon: "home"
        component Icon icon: "search"
        component Icon icon: "settings"
        component Icon icon: "user"
      }

      // Icon buttons for actions
      component Heading text: "Actions"
      layout stack(direction: horizontal, gap: 8) {
        component IconButton icon: "download" variant: "primary"
        component IconButton icon: "trash-2" variant: "danger"
        component IconButton icon: "check" variant: "primary"
        component IconButton icon: "x" variant: "danger"
      }

      // Disabled buttons
      layout stack(direction: horizontal, gap: 8) {
        component IconButton icon: "lock" variant: "default" disabled: true
        component IconButton icon: "settings" variant: "primary" disabled: true
      }
    }
  }
}
```

## Styling Notes

- **Icons** scale to fit their container while maintaining aspect ratio
- **IconButtons** are square buttons (equal width and height)
- Colors are determined by:
  - For `Icon`: renderer defaults
  - For `IconButton`: the selected `variant`
- **Disabled** state reduces opacity to 0.5 (visual feedback)

## Icon Sources

All icons are from [Feather Icons](https://feathericons.com) by Cole Bemis and contributors, licensed under the MIT License.

See [ICONS-LICENSE.md](../../../packages/engine/src/renderer/icons/ICONS-LICENSE.md) for full attribution details.

## Rendering

- Icons are rendered as **inline SVG** in the output
- They scale seamlessly from low-resolution wireframes to high-DPI displays
- All icons use **stroke-based** rendering (not fill) for consistent appearance with the `stroke: currentColor` attribute
- The stroke width is fixed at 2px for consistency across sizes
