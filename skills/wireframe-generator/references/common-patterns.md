---
name: Common Patterns
description: Reusable patterns for forms, dashboards, navigation, product grids, and more
---

# Wire DSL Common Patterns

This reference provides reusable, copy-paste-ready patterns for common UI scenarios. All examples are complete and syntactically valid.

## Form Patterns

### Basic Contact Form

```wire
project "Contact Form" {
  theme {
    density: "normal"
    spacing: "md"
    radius: "md"
    stroke: "normal"
    font: "base"
  }

  screen ContactForm {
    layout stack(direction: vertical, gap: lg, padding: xl) {
      component Heading text: "Get in Touch"
      component Text content: "Fill out the form below and we'll get back to you soon."

      layout stack(direction: vertical, gap: md) {
        component Input label: "Name" placeholder: "John Doe"
        component Input label: "Email" placeholder: "john@example.com"
        component Input label: "Subject" placeholder: "How can we help?"
        component Textarea label: "Message" placeholder: "Your message here..." rows: 6
      }

      component Checkbox label: "I agree to the privacy policy"

      layout stack(direction: horizontal, gap: md, align: right) {
        component Button text: "Cancel" variant: secondary
        component Button text: "Send Message" variant: primary
      }
    }
  }
}
```

### Registration Form with Sections

```wire
project "Registration" {
  theme {
    density: "normal"
    spacing: "md"
    radius: "md"
    stroke: "normal"
    font: "base"
  }

  screen Registration {
    layout stack(direction: vertical, gap: xl, padding: xl) {
      component Heading text: "Create Your Account"
      component Divider

      // Personal Information
      component Label text: "Personal Information"
      layout stack(direction: vertical, gap: md) {
        layout grid(columns: 12, gap: md) {
          cell span: 6 {
            component Input label: "First Name" placeholder: "John"
          }
          cell span: 6 {
            component Input label: "Last Name" placeholder: "Doe"
          }
        }
        component Input label: "Email" placeholder: "john@example.com"
        component Input label: "Phone" placeholder: "+1 (555) 123-4567"
      }

      component Divider

      // Account Details
      component Label text: "Account Details"
      layout stack(direction: vertical, gap: md) {
        component Input label: "Username" placeholder: "johndoe"
        component Input label: "Password" placeholder: "••••••••"
        component Input label: "Confirm Password" placeholder: "••••••••"
      }

      component Divider

      // Preferences
      component Label text: "Preferences"
      layout stack(direction: vertical, gap: sm) {
        component Checkbox label: "Subscribe to newsletter" checked: true
        component Checkbox label: "Enable email notifications"
        component Checkbox label: "Make profile public"
      }

      component Divider

      // Terms
      component Checkbox label: "I agree to the Terms of Service and Privacy Policy" checked: false

      // Actions
      layout stack(direction: horizontal, gap: md, align: right) {
        component Button text: "Cancel" variant: secondary
        component Button text: "Create Account" variant: primary
      }
    }
  }
}
```

### Login Form

```wire
project "Login" {
  theme {
    density: "normal"
    spacing: "md"
    radius: "md"
    stroke: "normal"
    font: "base"
  }

  screen Login {
    layout stack(direction: vertical, gap: lg, padding: xl) {
      component Heading text: "Sign In"
      component Text content: "Enter your credentials to access your account"

      layout stack(direction: vertical, gap: md) {
        component Input label: "Email" placeholder: "your@email.com"
        component Input label: "Password" placeholder: "Enter password"
      }

      layout stack(direction: horizontal, gap: md, align: justify) {
        component Checkbox label: "Remember me"
        component Link text: "Forgot password?"
      }

      component Button text: "Sign In" variant: primary

      layout stack(direction: horizontal, gap: sm, align: center) {
        component Text content: "Don't have an account?"
        component Link text: "Sign up"
      }
    }
  }
}
```

---

## Dashboard Patterns

### Admin Dashboard with Sidebar

```wire
project "Admin Dashboard" {
  theme {
    density: "normal"
    spacing: "md"
    radius: "md"
    stroke: "normal"
    font: "base"
  }

  screen Dashboard {
    layout split(sidebar: 260, gap: md) {
      // Sidebar
      layout stack(direction: vertical, gap: md, padding: md) {
        component Heading text: "Admin Panel"
        component SidebarMenu items: "Dashboard,Users,Products,Orders,Analytics,Settings" active: 0
        component Divider
        layout stack(direction: horizontal, gap: sm, align: left) {
          component Image placeholder: "square"
          layout stack(direction: vertical, gap: xs) {
            component Text content: "Admin User"
            component Badge text: "Online" variant: success
          }
        }
      }

      // Main Content
      layout stack(direction: vertical, gap: lg, padding: lg) {
        component Topbar title: "Dashboard" subtitle: "Welcome back!" user: "admin@example.com"

        // Stats Grid
        layout grid(columns: 12, gap: md) {
          cell span: 3 {
            component Stat title: "Total Users" value: "2,543"
          }
          cell span: 3 {
            component Stat title: "Revenue" value: "$45,230"
          }
          cell span: 3 {
            component Stat title: "Active Orders" value: "892"
          }
          cell span: 3 {
            component Stat title: "Growth" value: "+12.5%"
          }
        }

        // Charts
        layout grid(columns: 12, gap: lg) {
          cell span: 8 {
            layout panel(padding: md) {
              layout stack(direction: vertical, gap: md) {
                component Heading text: "Revenue Overview"
                component ChartPlaceholder type: "line" height: 300
              }
            }
          }
          cell span: 4 {
            layout panel(padding: md) {
              layout stack(direction: vertical, gap: md) {
                component Heading text: "Traffic Sources"
                component ChartPlaceholder type: "pie" height: 300
              }
            }
          }
        }

        // Recent Activity
        component Heading text: "Recent Orders"
        component Table columns: "Order ID,Customer,Product,Amount,Status" rows: 8
      }
    }
  }
}
```

### Metrics Dashboard

```wire
project "Metrics Dashboard" {
  theme {
    density: "comfortable"
    spacing: "lg"
    radius: "md"
    stroke: "normal"
    font: "base"
  }

  screen Metrics {
    layout stack(direction: vertical, gap: xl, padding: xl) {
      // Header
      layout grid(columns: 12, gap: md) {
        cell span: 8 {
          component Heading text: "Performance Metrics"
        }
        cell span: 4 align: end {
          component Select label: "Time Period" items: "Last 7 days,Last 30 days,Last 90 days,This year"
        }
      }

      // KPI Cards
      layout grid(columns: 12, gap: lg) {
        cell span: 3 {
          layout card(padding: lg, gap: sm) {
            component Icon name: "users"
            component Stat title: "Active Users" value: "1,234"
            component Badge text: "+15% vs last week" variant: success
          }
        }
        cell span: 3 {
          layout card(padding: lg, gap: sm) {
            component Icon name: "dollar-sign"
            component Stat title: "Revenue" value: "$45,230"
            component Badge text: "+8% vs last week" variant: success
          }
        }
        cell span: 3 {
          layout card(padding: lg, gap: sm) {
            component Icon name: "shopping-cart"
            component Stat title: "Orders" value: "892"
            component Badge text: "-3% vs last week" variant: warning
          }
        }
        cell span: 3 {
          layout card(padding: lg, gap: sm) {
            component Icon name: "trending-up"
            component Stat title: "Conversion" value: "3.2%"
            component Badge text: "+0.5% vs last week" variant: success
          }
        }
      }

      // Charts Row
      layout grid(columns: 12, gap: lg) {
        cell span: 8 {
          component ChartPlaceholder type: "area" height: 400
        }
        cell span: 4 {
          component ChartPlaceholder type: "bar" height: 400
        }
      }

      // Data Table
      component Heading text: "Recent Transactions"
      component Table columns: "Date,Transaction ID,Customer,Amount,Status" rows: 10
    }
  }
}
```

---

## Product Grid Patterns

### E-Commerce Product Grid

Note: Using user-defined component.

```wire
project "Product Catalog" {
  theme {
    density: "comfortable"
    spacing: "lg"
    radius: "lg"
    stroke: "thin"
    font: "base"
  }

  define Component "ProductSample" {
    layout card(padding: md, gap: md, radius: lg, border: true) {
      component Image placeholder: "square" height: 250
      component Heading text: "Smart Watch"
      component Text content: "Track fitness and health metrics"
      component Badge text: "Sale" variant: success
      layout stack(direction: horizontal, gap: md, align: justify) {
        component Heading text: "$199.99"
        component Button text: "Add to Cart" variant: primary
      }
    }
  }

  screen Products {
    layout stack(direction: vertical, gap: xl, padding: xl) {
      // Header with Search
      layout grid(columns: 12, gap: md) {
        cell span: 6 {
          component Heading text: "Featured Products"
        }
        cell span: 4 {
          component Input label: "Search" placeholder: "Search products..."
        }
        cell span: 2 align: end {
          component Button text: "Filter" variant: secondary
        }
      }

      // Product Grid
      layout grid(columns: 12, gap: xl) {
        cell span: 4 {
          layout card(padding: md, gap: md, radius: lg, border: true) {
            component Image placeholder: "square" height: 250
            component Heading text: "Wireless Headphones"
            component Text content: "Premium noise-cancelling headphones"
            component Badge text: "New" variant: primary
            layout stack(direction: horizontal, gap: md, align: justify) {
              component Heading text: "$129.99"
              component Button text: "Add to Cart" variant: primary
            }
          }
        }

        cell span: 4 {
          component ProductSample
        }

        cell span: 4 {
          component ProductSample
        }

        cell span: 4 {
          component ProductSample
        }

        cell span: 4 {
          component ProductSample
        }

        cell span: 4 {
          component ProductSample
        }
      }

      component Divider

      // Pagination
      layout stack(direction: horizontal, gap: sm, align: center) {
        component Button text: "Previous"
        component Text content: "Page 1 of 5"
        component Button text: "Next" variant: primary
      }
    }
  }
}
```

### Product Detail Page

```wire
project "Product Detail" {
  theme {
    density: "normal"
    spacing: "md"
    radius: "md"
    stroke: "normal"
    font: "base"
  }

  screen ProductDetail {
    layout stack(direction: vertical, gap: lg, padding: lg) {
      component Breadcrumbs items: "Home,Products,Electronics,Headphones"

      layout grid(columns: 12, gap: xl) {
        // Product Images
        cell span: 6 {
          layout stack(direction: vertical, gap: md) {
            component Image placeholder: "square" height: 500
            layout grid(columns: 12, gap: sm) {
              cell span: 3 {
                component Image placeholder: "square" height: 100
              }
              cell span: 3 {
                component Image placeholder: "square" height: 100
              }
              cell span: 3 {
                component Image placeholder: "square" height: 100
              }
              cell span: 3 {
                component Image placeholder: "square" height: 100
              }
            }
          }
        }

        // Product Info
        cell span: 6 {
          layout stack(direction: vertical, gap: lg) {
            component Heading text: "Premium Wireless Headphones"
            component Badge text: "In Stock" variant: success

            component Stat title: "Price" value: "$129.99"

            component Text content: "Experience superior sound quality with our premium wireless headphones featuring active noise cancellation and 30-hour battery life."

            component Divider

            // Options
            component Select label: "Color" items: "Black,White,Blue,Red"
            component Select label: "Quantity" items: "1,2,3,4,5"

            // Actions
            layout stack(direction: horizontal, gap: md, align: left) {
              component Button text: "Add to Cart" variant: primary
              component IconButton icon: "heart"
              component IconButton icon: "share-2"
            }

            component Divider

            // Features
            component Label text: "Features"
            layout stack(direction: vertical, gap: xs) {
              component Text content: "✓ Active Noise Cancellation"
              component Text content: "✓ 30-hour battery life"
              component Text content: "✓ Bluetooth 5.0"
              component Text content: "✓ Premium materials"
              component Text content: "✓ Foldable design"
            }
          }
        }
      }

      // Tabs for Details
      component Tabs items: "Description,Specifications,Reviews,Shipping" activeIndex: 0

      layout panel(padding: lg) {
        layout stack(direction: vertical, gap: md) {
          component Text content: "These premium wireless headphones deliver exceptional sound quality with deep bass and crystal-clear highs. The active noise cancellation technology blocks out ambient noise, allowing you to focus on your music."
          component Text content: "Designed for all-day comfort with soft ear cushions and an adjustable headband. The 30-hour battery life ensures you can enjoy your music for days without recharging."
        }
      }
    }
  }
}
```

---

## User Profile Patterns

### User Profile with Tabs

```wire
project "User Profile" {
  theme {
    density: "normal"
    spacing: "md"
    radius: "md"
    stroke: "normal"
    font: "base"
  }

  screen Profile {
    layout stack(direction: vertical, gap: lg, padding: lg) {
      // Profile Header
      layout card(padding: lg, gap: md) {
        layout stack(direction: horizontal, gap: lg, align: left) {
          component Image placeholder: "square"
          layout stack(direction: vertical, gap: sm) {
            component Heading text: "John Doe"
            component Text content: "Senior Developer"
            component Text content: "john.doe@example.com"
            layout stack(direction: horizontal, gap: sm, align: left) {
              component Badge text: "Pro Member" variant: primary
              component Badge text: "Verified" variant: success
            }
          }
        }
      }

      // Tabs
      component Tabs items: "Overview,Settings,Activity,Billing" activeIndex: 0

      // Tab Content
      layout grid(columns: 12, gap: lg) {
        // Left Column
        cell span: 8 {
          layout stack(direction: vertical, gap: md) {
            layout panel(padding: md) {
              layout stack(direction: vertical, gap: md) {
                component Heading text: "About"
                component Text content: "Passionate developer with 10+ years of experience in full-stack development. Specializing in JavaScript, React, and Node.js."
              }
            }

            layout panel(padding: md) {
              layout stack(direction: vertical, gap: md) {
                component Heading text: "Recent Activity"
                component List items: "Completed project Alpha,Updated profile picture,Joined team Beta,Earned achievement badge"
              }
            }
          }
        }

        // Right Column
        cell span: 4 {
          layout stack(direction: vertical, gap: md) {
            layout card(padding: md, gap: sm) {
              component Heading text: "Stats"
              component Stat title: "Projects" value: "47"
              component Stat title: "Contributions" value: "1,234"
              component Stat title: "Followers" value: "892"
            }

            layout card(padding: md, gap: sm) {
              component Heading text: "Skills"
              layout stack(direction: horizontal, gap: xs, align: left) {
                component Badge text: "JavaScript" variant: info
                component Badge text: "React" variant: info
                component Badge text: "Node.js" variant: info
              }
              layout stack(direction: horizontal, gap: xs, align: left) {
                component Badge text: "TypeScript" variant: info
                component Badge text: "GraphQL" variant: info
              }
            }
          }
        }
      }
    }
  }
}
```

---

## Settings Page Patterns

### Settings with Sidebar

```wire
project "Settings" {
  theme {
    density: "normal"
    spacing: "md"
    radius: "md"
    stroke: "normal"
    font: "base"
  }

  screen Settings {
    layout split(sidebar: 240, gap: md) {
      // Settings Navigation
      layout stack(direction: vertical, gap: sm, padding: md) {
        component Heading text: "Settings"
        component SidebarMenu items: "Profile,Account,Privacy,Notifications,Billing,Security" active: 0
      }

      // Settings Content
      layout stack(direction: vertical, gap: xl, padding: lg) {
        component Heading text: "Profile Settings"

        // Profile Photo
        layout panel(padding: md) {
          layout stack(direction: vertical, gap: md) {
            component Label text: "Profile Photo"
            component Image placeholder: "square"
            layout stack(direction: horizontal, gap: sm, align: left) {
              component Button text: "Upload New" variant: primary
              component Button text: "Remove"
            }
          }
        }

        // Basic Information
        layout panel(padding: md) {
          layout stack(direction: vertical, gap: md) {
            component Label text: "Basic Information"
            layout grid(columns: 12, gap: md) {
              cell span: 6 {
                component Input label: "First Name" placeholder: "John"
              }
              cell span: 6 {
                component Input label: "Last Name" placeholder: "Doe"
              }
            }
            component Input label: "Email" placeholder: "john@example.com"
            component Input label: "Phone" placeholder: "+1 (555) 123-4567"
            component Textarea label: "Bio" placeholder: "Tell us about yourself" rows: 4
          }
        }

        // Preferences
        layout panel(padding: md) {
          layout stack(direction: vertical, gap: md) {
            component Label text: "Preferences"
            component Select label: "Language" items: "English,Spanish,French,German"
            component Select label: "Timezone" items: "UTC-8,UTC-5,UTC,UTC+1,UTC+8"
            component Toggle label: "Dark Mode" enabled: false
            component Toggle label: "Email Notifications" enabled: true
          }
        }

        // Actions
        layout stack(direction: horizontal, gap: md, align: right) {
          component Button text: "Cancel" variant: secondary
          component Button text: "Save Changes" variant: primary
        }
      }
    }
  }
}
```

---

## Data Table Patterns

### Users List with Actions

```wire
project "Users Management" {
  theme {
    density: "normal"
    spacing: "md"
    radius: "md"
    stroke: "normal"
    font: "base"
  }

  screen UsersList {
    layout stack(direction: vertical, gap: lg, padding: lg) {
      // Header with Actions
      layout grid(columns: 12, gap: md) {
        cell span: 6 {
          component Heading text: "Users"
        }
        cell span: 4 {
          component Input label: "Search" placeholder: "Search by name or email..."
        }
        cell span: 2 align: end {
          component Button text: "Add User" variant: primary
        }
      }

      // Filters
      layout card (padding: lg) {
        layout stack(direction: horizontal, gap: md, align: justify) {
          component Select label: "Role" items: "All,Admin,User,Guest"
          component Select label: "Status" items: "All,Active,Inactive,Pending"
          component Button text: "Apply Filters"
        }
      }

      // Users Table
      component Table columns: "Name,Email,Role,Status,Last Login,Actions" rows: 10 pagination: true
    }
  }
}
```

---

## Quick Selection Guide

**Need a form?** → Use Form Patterns
**Need a dashboard?** → Use Dashboard Patterns
**Need product cards?** → Use Product Grid Patterns
**Need user profile?** → Use User Profile Patterns
**Need settings page?** → Use Settings Page Patterns
**Need data table?** → Use Data Table Patterns

All patterns are production-ready and can be customized by changing text, colors, and spacing values.

<!-- Source: examples/*.wire, .ai/AI-INSTRUCTIONS-MAIN.md, docs/EXAMPLES.md -->
