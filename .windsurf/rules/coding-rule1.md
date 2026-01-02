---
trigger: always_on
---
cat > .windsurf/rules/coding-rule1.md << 'EOF'
---
trigger: manual
---

# Feature Implementation Checklist

## Before Implementing Any Feature, Ask:

1. **All UI elements affected** - What other components represent or depend on this feature's data?
   - Example: "My Location" button → also affects the "You are here" red marker

2. **Initial state impact** - Does this feature change how the app should start?
   - Example: If we have live location detection, why default to a hardcoded location?

3. **State flow** - What data needs to propagate where?
   - Example: GPS coordinates need to update both map center AND user marker position

4. **Edge cases** - What if the feature fails or is denied?
   - Example: Geolocation denied → show zoomed-out country view, not a random city

5. **Complete user journey** - Think in user flow terms, not isolated feature terms
   - Map the full experience, not just the button click

## Key Principle

> "If this feature exists, what else must change to make it coherent?"

Don't implement features in isolation - always consider their ripple effects across the entire system.
EOF