"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Highlight from "@tiptap/extension-highlight";
import {
  Box,
  IconButton,
  Divider,
  Tooltip,
  Select,
  MenuItem,
  alpha,
  Paper,
} from "@mui/material";
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  StrikethroughS,
  Code,
  FormatQuote,
  FormatListBulleted,
  FormatListNumbered,
  FormatAlignLeft,
  FormatAlignCenter,
  FormatAlignRight,
  InsertLink,
  Image as ImageIcon,
  Undo,
  Redo,
  HorizontalRule,
  Highlight as HighlightIcon,
  FormatClear,
  DataObject as CodeBlockIcon,
} from "@mui/icons-material";
import { useCallback, useEffect } from "react";

interface TipTapEditorProps {
  content: string;
  onChange: (html: string) => void;
  editable?: boolean;
}

export default function TipTapEditor({ content, onChange, editable = true }: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Image.configure({ inline: true, allowBase64: true }),
      Link.configure({ openOnClick: false, autolink: true }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Color,
      TextStyle,
      Highlight.configure({ multicolor: true }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const addImage = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("URL da imagem:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const addLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL do link:", previousUrl);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  const TB = ({ onClick, isActive, title, children }: {
    onClick: () => void;
    isActive?: boolean;
    title: string;
    children: React.ReactNode;
  }) => (
    <Tooltip title={title} arrow enterDelay={400}>
      <IconButton
        size="small"
        onMouseDown={(e) => { e.preventDefault(); onClick(); }}
        sx={{
          borderRadius: 1.5,
          color: isActive ? "#8270FF" : "#64748b",
          bgcolor: isActive ? alpha("#8270FF", 0.1) : "transparent",
          "&:hover": { bgcolor: isActive ? alpha("#8270FF", 0.15) : alpha("#64748b", 0.08) },
          width: 34,
          height: 34,
          transition: "all 0.15s ease",
        }}
      >
        {children}
      </IconButton>
    </Tooltip>
  );

  const Sep = () => <Divider orientation="vertical" flexItem sx={{ mx: 0.75, my: 0.5 }} />;

  return (
    <Box>
      {/* Sticky Toolbar */}
      {editable && (
        <Paper
          elevation={0}
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 0.25,
            px: 1.5,
            py: 0.75,
            mb: 0,
            borderBottom: "1px solid",
            borderColor: alpha("#94a3b8", 0.2),
            bgcolor: "#fff",
            backdropFilter: "blur(8px)",
          }}
        >
          <Select
            size="small"
            value={
              editor.isActive("heading", { level: 1 }) ? "h1" :
              editor.isActive("heading", { level: 2 }) ? "h2" :
              editor.isActive("heading", { level: 3 }) ? "h3" : "paragraph"
            }
            onChange={(e) => {
              const val = e.target.value;
              if (val === "paragraph") editor.chain().focus().setParagraph().run();
              else if (val === "h1") editor.chain().focus().toggleHeading({ level: 1 }).run();
              else if (val === "h2") editor.chain().focus().toggleHeading({ level: 2 }).run();
              else if (val === "h3") editor.chain().focus().toggleHeading({ level: 3 }).run();
            }}
            sx={{
              height: 34,
              minWidth: 140,
              fontSize: "0.8125rem",
              fontWeight: 500,
              mr: 0.5,
              "& .MuiOutlinedInput-notchedOutline": { borderColor: alpha("#94a3b8", 0.25) },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: alpha("#8270FF", 0.4) },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#8270FF" },
            }}
          >
            <MenuItem value="paragraph">Parágrafo</MenuItem>
            <MenuItem value="h1">Título 1</MenuItem>
            <MenuItem value="h2">Título 2</MenuItem>
            <MenuItem value="h3">Título 3</MenuItem>
          </Select>

          <Sep />

          <TB onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive("bold")} title="Negrito (Ctrl+B)">
            <FormatBold fontSize="small" />
          </TB>
          <TB onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive("italic")} title="Itálico (Ctrl+I)">
            <FormatItalic fontSize="small" />
          </TB>
          <TB onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive("underline")} title="Sublinhado (Ctrl+U)">
            <FormatUnderlined fontSize="small" />
          </TB>
          <TB onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive("strike")} title="Riscado">
            <StrikethroughS fontSize="small" />
          </TB>
          <TB onClick={() => editor.chain().focus().toggleHighlight({ color: "#fef08a" }).run()} isActive={editor.isActive("highlight")} title="Destacar">
            <HighlightIcon fontSize="small" />
          </TB>
          <TB onClick={() => editor.chain().focus().toggleCode().run()} isActive={editor.isActive("code")} title="Código inline">
            <Code fontSize="small" />
          </TB>

          <Sep />

          <TB onClick={() => editor.chain().focus().setTextAlign("left").run()} isActive={editor.isActive({ textAlign: "left" })} title="Esquerda">
            <FormatAlignLeft fontSize="small" />
          </TB>
          <TB onClick={() => editor.chain().focus().setTextAlign("center").run()} isActive={editor.isActive({ textAlign: "center" })} title="Centro">
            <FormatAlignCenter fontSize="small" />
          </TB>
          <TB onClick={() => editor.chain().focus().setTextAlign("right").run()} isActive={editor.isActive({ textAlign: "right" })} title="Direita">
            <FormatAlignRight fontSize="small" />
          </TB>

          <Sep />

          <TB onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive("bulletList")} title="Lista">
            <FormatListBulleted fontSize="small" />
          </TB>
          <TB onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive("orderedList")} title="Lista numerada">
            <FormatListNumbered fontSize="small" />
          </TB>
          <TB onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive("blockquote")} title="Citação">
            <FormatQuote fontSize="small" />
          </TB>
          <TB onClick={() => editor.chain().focus().toggleCodeBlock().run()} isActive={editor.isActive("codeBlock")} title="Bloco de código">
            <CodeBlockIcon fontSize="small" />
          </TB>
          <TB onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divisor">
            <HorizontalRule fontSize="small" />
          </TB>

          <Sep />

          <TB onClick={addLink} isActive={editor.isActive("link")} title="Link">
            <InsertLink fontSize="small" />
          </TB>
          <TB onClick={addImage} title="Imagem">
            <ImageIcon fontSize="small" />
          </TB>

          <Box sx={{ flex: 1 }} />

          <TB onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} title="Limpar formatação">
            <FormatClear fontSize="small" />
          </TB>
          <TB onClick={() => editor.chain().focus().undo().run()} title="Desfazer (Ctrl+Z)">
            <Undo fontSize="small" />
          </TB>
          <TB onClick={() => editor.chain().focus().redo().run()} title="Refazer (Ctrl+Y)">
            <Redo fontSize="small" />
          </TB>
        </Paper>
      )}

      {/* Editor Content */}
      <Box
        sx={{
          "& .tiptap": {
            outline: "none",
            minHeight: editable ? 500 : 200,
            maxWidth: 820,
            mx: "auto",
            px: { xs: 2, md: 5 },
            py: 4,
            fontSize: "1rem",
            lineHeight: 1.75,
            color: "#1e293b",
            "& h1": {
              fontSize: "2rem",
              fontWeight: 700,
              letterSpacing: "-0.025em",
              color: "#0f172a",
              mt: 4,
              mb: 1.5,
              lineHeight: 1.3,
            },
            "& h2": {
              fontSize: "1.5rem",
              fontWeight: 600,
              letterSpacing: "-0.02em",
              color: "#0f172a",
              mt: 3,
              mb: 1,
              lineHeight: 1.35,
              pb: 0.75,
              borderBottom: "1px solid",
              borderColor: alpha("#94a3b8", 0.15),
            },
            "& h3": {
              fontSize: "1.25rem",
              fontWeight: 600,
              color: "#1e293b",
              mt: 2.5,
              mb: 0.75,
              lineHeight: 1.4,
            },
            "& p": { mb: 1.25, lineHeight: 1.75 },
            "& ul, & ol": { pl: 3, mb: 1.25 },
            "& li": { mb: 0.5, lineHeight: 1.7 },
            "& li > p": { mb: 0.25 },
            "& blockquote": {
              borderLeft: "3px solid",
              borderColor: "#8270FF",
              bgcolor: alpha("#8270FF", 0.03),
              borderRadius: "0 8px 8px 0",
              pl: 2.5,
              pr: 2,
              py: 1,
              ml: 0,
              my: 1.5,
              color: "#475569",
              fontStyle: "italic",
              "& p": { mb: 0.5 },
            },
            "& pre": {
              bgcolor: "#0f172a",
              color: "#e2e8f0",
              borderRadius: 2,
              p: 2.5,
              mb: 1.5,
              overflow: "auto",
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              fontSize: "0.8125rem",
              lineHeight: 1.6,
              border: "1px solid",
              borderColor: alpha("#94a3b8", 0.1),
            },
            "& code": {
              bgcolor: alpha("#8270FF", 0.08),
              color: "#7c3aed",
              borderRadius: "4px",
              px: 0.75,
              py: 0.125,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              fontSize: "0.85em",
              fontWeight: 500,
            },
            "& pre code": {
              bgcolor: "transparent",
              color: "inherit",
              px: 0,
              py: 0,
              fontWeight: 400,
            },
            "& img": {
              maxWidth: "100%",
              height: "auto",
              borderRadius: 2,
              my: 2,
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            },
            "& a": {
              color: "#8270FF",
              textDecoration: "none",
              borderBottom: "1px solid",
              borderColor: alpha("#8270FF", 0.3),
              transition: "all 0.15s",
              "&:hover": {
                borderColor: "#8270FF",
              },
            },
            "& hr": {
              border: "none",
              height: "1px",
              bgcolor: alpha("#94a3b8", 0.2),
              my: 3,
            },
            "& mark": {
              borderRadius: "3px",
              px: "3px",
              py: "1px",
              boxDecorationBreak: "clone",
            },
          },
        }}
      >
        <EditorContent editor={editor} />
      </Box>
    </Box>
  );
}
