import bpy
import os

print("="*60)
print("BlenderKit Installation Check")
print("="*60)

# Check if BlenderKit is already available
addon_found = False
for mod in bpy.context.preferences.addons:
    if 'blenderkit' in mod.module.lower():
        addon_found = True
        print(f"\n✓ BlenderKit found: {mod.module}")
        break

if not addon_found:
    print("\n✗ BlenderKit not found in installed add-ons")
    print("\nSearching in available add-ons...")
    
    # Try to enable if available but not enabled
    try:
        bpy.ops.preferences.addon_enable(module="blenderkit")
        print("✓ BlenderKit enabled successfully!")
        addon_found = True
    except:
        print("✗ BlenderKit not available as built-in add-on")
        print("\nYou need to download BlenderKit manually from:")
        print("https://www.blenderkit.com/")

if addon_found:
    print("\n" + "="*60)
    print("BlenderKit is ready to use!")
    print("="*60)
    print("\nNext steps:")
    print("1. Press N in 3D viewport")
    print("2. Find BlenderKit panel on right side")
    print("3. Login with your free account")
    print("4. Start browsing 10,000+ free assets!")
    print("="*60)
else:
    print("\n" + "="*60)
    print("Manual installation needed")
    print("="*60)

# Save preferences
bpy.ops.wm.save_userpref()

