filepath = 'src/modules/helpdesk/components/TicketDetail.js'
with open(filepath, 'r') as f:
    content = f.read()

import re

# Add import for WPEditor
if "WPEditor" not in content:
    content = content.replace("import EditModal from '../../../components/EditModal';", "import EditModal from '../../../components/EditModal';\nimport WPEditor from '../../../components/WPEditor';")

# Replace TextareaControl with WPEditor for reply body
editor_jsx = """
									<WPEditor
										id="ticket-reply-editor"
										value={ replyText }
										onChange={ setReplyText }
										placeholder={ isNote ? __( 'Type an internal note...', 'sahajanand-erp' ) : __( 'Type your reply...', 'sahajanand-erp' ) }
										style={{ minHeight: '120px', backgroundColor: isNote ? '#fffde7' : '#fff' }}
									/>
"""

content = re.sub(
    r"<TextareaControl\s*value=\{\s*replyText\s*\}\s*onChange=\{\s*setReplyText\s*\}.*?/>",
    editor_jsx.strip(),
    content,
    flags=re.DOTALL
)

with open(filepath, 'w') as f:
    f.write(content)
