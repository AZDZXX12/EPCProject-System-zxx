import bpy
import os

print("="*60)
print("Poly Haven Asset Library Auto Configuration")
print("="*60)

# Create default asset library path
asset_path = os.path.join(os.path.expanduser("~"), "Documents", "Blender_Assets", "PolyHaven")
os.makedirs(asset_path, exist_ok=True)

print(f"\nCreating asset library at:\n{asset_path}")

# Get preferences
prefs = bpy.context.preferences
filepaths = prefs.filepaths

# Check if Poly Haven library already exists
existing = False
for lib in filepaths.asset_libraries:
    if lib.name == "Poly Haven":
        existing = True
        print("\n✓ Poly Haven library already exists!")
        print(f"  Path: {lib.path}")
        break

# Add new library if doesn't exist
if not existing:
    try:
        bpy.ops.preferences.asset_library_add(directory=asset_path)
        # Set the name
        new_lib = filepaths.asset_libraries[-1]
        new_lib.name = "Poly Haven"
        new_lib.path = asset_path
        print("\n✓ Poly Haven library added!")
        print(f"  Name: Poly Haven")
        print(f"  Path: {asset_path}")
    except Exception as e:
        print(f"\n✗ Error adding library: {e}")
        print("\nPlease add manually:")
        print("Edit > Preferences > File Paths > Asset Libraries > +")

# Save preferences
bpy.ops.wm.save_userpref()
print("\n✓ Preferences saved!")

print("\n" + "="*60)
print("NEXT STEPS:")
print("="*60)
print("\n1. Switch to Asset Browser:")
print("   - Click editor icon (top-left)")
print("   - Select 'Asset Browser'")
print("\n2. Select 'Poly Haven' from dropdown at top")
print("\n3. Click 'Fetch Assets' button")
print("\n4. Wait for download (~3.3GB)")
print("\n" + "="*60)

