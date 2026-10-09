import os
import re

directory = "backend/app/routers"
for filename in os.listdir(directory):
    if not filename.endswith(".py") or filename == "__init__.py":
        continue
        
    filepath = os.path.join(directory, filename)
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
        
    # Remove imports
    content = re.sub(r'from backend\.app\.database import get_db\n', '', content)
    content = re.sub(r'from backend\.app\.security import get_current_user\n', '', content)
    content = re.sub(r'from backend\.app import models, schemas', 'from backend.app import schemas', content)
    content = re.sub(r'from sqlalchemy\.orm import Session\n', '', content)
    
    # Remove Depends
    content = re.sub(r',\s*db:\s*Session\s*=\s*Depends\(get_db\)', '', content)
    content = re.sub(r'\s*db:\s*Session\s*=\s*Depends\(get_db\),', '', content)
    content = re.sub(r',\s*current_user:\s*models\.User\s*=\s*Depends\(get_current_user\)', '', content)
    content = re.sub(r'\s*current_user:\s*models\.User\s*=\s*Depends\(get_current_user\),?', '', content)
    
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
