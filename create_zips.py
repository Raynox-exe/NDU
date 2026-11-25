import os
import zipfile

root_dir = os.path.abspath('.')

# 1. All files edited today with their exact relative paths
edited_files = [
    'src/App.tsx',
    'src/components/AdminDashboardView.tsx',
    'src/components/AuthModal.tsx',
    'src/components/DigitalLibraryView.tsx',
    'src/components/HeaderNav.tsx',
    'src/components/HomeAboutView.tsx',
    'src/components/NewspapersView.tsx',
    'src/components/ServicesNewsContactViews.tsx',
    'src/data/libraryMeta.ts',
    'src/data/newspapersData.ts',
    'src/services/api.ts',
    'server/db.js',
    'server/db-mysql.js',
    'database/schema.sql',
    'server/routes/admin.js',
    'server/routes/public.js',
    'public/uploads/resources/thisday_nov_21_2026.pdf',
    'public/uploads/resources/thisday_nov_21_2026_cover.jpg',
]

print("1. Creating NDU_Library_Edited_Codes_Today.zip...")
with zipfile.ZipFile('NDU_Library_Edited_Codes_Today.zip', 'w', zipfile.ZIP_DEFLATED) as z:
    for rel_path in edited_files:
        full_path = os.path.join(root_dir, rel_path.replace('/', os.sep))
        if os.path.exists(full_path):
            z.write(full_path, rel_path)
            print(f"  + Added: {rel_path} ({os.path.getsize(full_path):,} bytes)")
        else:
            print(f"  ! Missing: {full_path}")

# 2. Production build dist zip
print("\n2. Creating NDU_Library_Production_Build_dist.zip...")
with zipfile.ZipFile('NDU_Library_Production_Build_dist.zip', 'w', zipfile.ZIP_DEFLATED) as z:
    for root, dirs, files in os.walk(os.path.join(root_dir, 'dist')):
        for file in files:
            full_path = os.path.join(root, file)
            arcname = os.path.relpath(full_path, os.path.join(root_dir, 'dist'))
            z.write(full_path, arcname)
print(f"  Done: dist zip size: {os.path.getsize('NDU_Library_Production_Build_dist.zip'):,} bytes")

# 3. Full Deployable Source zip (excluding node_modules, .git, and existing large zip archives)
print("\n3. Creating NDU_Library_Full_Deployable.zip...")
ignore_dirs = {'.git', 'node_modules', '.idea', '.vscode'}
with zipfile.ZipFile('NDU_Library_Full_Deployable.zip', 'w', zipfile.ZIP_DEFLATED) as z:
    for root, dirs, files in os.walk(root_dir):
        dirs[:] = [d for d in dirs if d not in ignore_dirs]
        for file in files:
            if file.endswith('.zip') or file.endswith('.pyc') or file == 'create_zips.py':
                continue
            full_path = os.path.join(root, file)
            arcname = os.path.relpath(full_path, root_dir)
            z.write(full_path, arcname)
print(f"  Done: full deployable zip size: {os.path.getsize('NDU_Library_Full_Deployable.zip'):,} bytes")

print("\nAll 3 deployable zip archives updated successfully!")
