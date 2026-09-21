import os

exclude_dirs = {'.git', 'node_modules', 'vendor', 'build', '.expo', '.agents'}
exclude_exts = {'.png', '.jpg', '.jpeg', '.gif', '.zip', '.lock'}

replacements = [
    ('SAHAJANAND_ERP_', 'SAHAJANAND_ERP_'),
    ('Sahajanand_ERP', 'Sahajanand_ERP'),
    ('sahajanand-erp', 'sahajanand-erp'),
    ('sahajanand_erp', 'sahajanand_erp'),
    ('sahajanandErp', 'sahajanandErp'),
]

root_dir = '/Users/multidots/Documents/Github/Simple-ERP-for-WordPress'

# Phase 1: Rename contents
for root, dirs, files in os.walk(root_dir):
    dirs[:] = [d for d in dirs if d not in exclude_dirs]
    
    for file in files:
        if any(file.endswith(ext) for ext in exclude_exts) or file == 'package-lock.json':
            continue
            
        filepath = os.path.join(root, file)
        
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception:
            continue
            
        new_content = content
        for pat, rep in replacements:
            new_content = new_content.replace(pat, rep)
            
        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated content in {filepath}")

# Phase 2: Rename files
for root, dirs, files in os.walk(root_dir, topdown=False):
    dirs[:] = [d for d in dirs if d not in exclude_dirs]
    
    for file in files:
        if 'sahajanand-erp' in file:
            old_path = os.path.join(root, file)
            new_name = file.replace('sahajanand-erp', 'sahajanand-erp')
            new_path = os.path.join(root, new_name)
            os.rename(old_path, new_path)
            print(f"Renamed file {old_path} -> {new_path}")
