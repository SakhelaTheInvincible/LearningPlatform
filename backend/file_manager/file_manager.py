import os
from docx import Document
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.conf import settings
from ai.services import generate_material_summary
from PyPDF2 import PdfReader
from striprtf.striprtf import rtf_to_text

def extract_text_from_docx(file_path):
    try:
        doc = Document(file_path)
        full_text = []
        for para in doc.paragraphs:
            full_text.append(para.text)
        return '\n'.join(full_text)
    except Exception as e:
        print(f"Error extracting text from {file_path}: {e}")
        return ""

def extract_text_from_txt(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            return file.read()
    except UnicodeDecodeError:
        encodings = ['latin-1', 'cp1252', 'iso-8859-1']
        for encoding in encodings:
            try:
                with open(file_path, 'r', encoding=encoding) as file:
                    return file.read()
            except UnicodeDecodeError:
                continue
        print(f"Failed to decode {file_path} with common encodings")
        return ""
    except Exception as e:
        print(f"Error extracting text from {file_path}: {e}")
        return ""


def extract_text_from_pdf(file_path):
    try:
        reader = PdfReader(file_path)
        text = []
        for page in reader.pages:
            text.append(page.extract_text())
        return '\n'.join(text)
    except Exception as e:
        print(f"Error extracting text from PDF {file_path}: {e}")
        return ""


def extract_text_from_markdown(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            return file.read()
    except Exception as e:
        print(f"Error extracting text from Markdown {file_path}: {e}")
        return ""


def extract_text_from_rtf(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            rtf_content = file.read()
            return rtf_to_text(rtf_content)
    except Exception as e:
        print(f"Error extracting text from RTF {file_path}: {e}")
        return ""

def extract_text(file_path):
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return ""
    
    _, ext = os.path.splitext(file_path)
    ext = ext.lower()
    
    extractors = {
        '.docx': extract_text_from_docx,
        '.txt': extract_text_from_txt,
        '.pdf': extract_text_from_pdf,
        '.md': extract_text_from_markdown,
        '.rtf': extract_text_from_rtf
    }

    extractor = extractors.get(ext)
    if extractor:
        return extractor(file_path)
    else:
        raise ValueError(f'Unsupported file extension: {ext}')


def process_material_file(file):
    """Process uploaded material file and return extracted text and summary.
    
    Args:
        file: Uploaded file object
        
    Returns:
        tuple: (extracted_text, summarized_text)
        
    Raises:
        ValueError: If file processing fails
    """
    try:
        # Save file temporarily
        file_path = default_storage.save(
            f'temp_{file.name}', ContentFile(file.read()))
        full_file_path = os.path.join(settings.MEDIA_ROOT, file_path)

        try:
            # Extract text from file
            material = extract_text(full_file_path)
            if not material:
                raise ValueError('Could not extract text from file')

            # Generate summary
            try:
                summarized_material = generate_material_summary(
                    material=material)
            except Exception as e:
                # Fallback summary if AI generation fails
                summarized_material = material[:500] + "..."

            return material, summarized_material

        finally:
            # Clean up temp file
            if os.path.exists(full_file_path):
                os.remove(full_file_path)

    except Exception as e:
        raise ValueError(f'Error processing file: {str(e)}')
