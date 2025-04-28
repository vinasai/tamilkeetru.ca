import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Bold, Italic, List, Heading, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';

interface RichTextEditorProps {
  initialValue?: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  initialValue = '',
  onChange,
  placeholder = 'Write your content here...'
}) => {
  const [value, setValue] = useState(initialValue);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const insertTag = (startTag: string, endTag: string = '') => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = value.substring(0, start) + startTag + selectedText + endTag + value.substring(end);
    
    setValue(newText);
    onChange(newText);
    
    // Reset cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + startTag.length, end + startTag.length);
    }, 0);
  };

  const handleBold = () => insertTag('**', '**');
  const handleItalic = () => insertTag('*', '*');
  const handleList = () => insertTag('\n- ');
  const handleHeading = () => insertTag('\n## ');
  
  const handleLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      if (!textareaRef.current) return;
      
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = value.substring(start, end);
      const linkText = selectedText || 'link text';
      
      insertTag(`[${linkText}](${url})`, '');
    }
  };
  
  const handleImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      insertTag(`\n![Image](${url})\n`);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    onChange(e.target.value);
  };

  return (
    <div className="border rounded-md">
      <div className="bg-muted p-2 border-b flex flex-wrap gap-1">
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          onClick={handleBold} 
          className="h-8 px-2"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          onClick={handleItalic} 
          className="h-8 px-2"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          onClick={handleList} 
          className="h-8 px-2"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          onClick={handleHeading} 
          className="h-8 px-2"
        >
          <Heading className="h-4 w-4" />
        </Button>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          onClick={handleLink} 
          className="h-8 px-2"
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          onClick={handleImage} 
          className="h-8 px-2"
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
      </div>
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleTextChange}
        placeholder={placeholder}
        className="border-none focus-visible:ring-0 min-h-[200px] resize-y p-3"
      />
      <div className="bg-muted px-3 py-2 text-xs text-muted-foreground">
        Supports Markdown. Use **bold**, *italic*, and other formatting.
      </div>
    </div>
  );
};

export { RichTextEditor };
