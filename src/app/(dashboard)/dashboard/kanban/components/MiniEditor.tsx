"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import {
  Box,
  IconButton,
  Tooltip,
  Divider,
  alpha,
} from "@mui/material";
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  FormatListBulleted,
  FormatListNumbered,
  Code,
  InsertLink,
  FormatQuote,
} from "@mui/icons-material";
import { useCallback, useEffect } from "react";

interface MiniEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}

const MAX_WIDTH = 800;
const MAX_HEIGHT = 600;
const QUALITY = 0.7;

function compressImage(file: File): Promise<string> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > MAX_WIDTH || height > MAX_HEIGHT) {
        const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/webp", QUALITY));
    };
    img.src = URL.createObjectURL(file);
  });
}

function insertImage(view: any, src: string, pos: number, replace: boolean) {
  const node = view.state.schema.nodes.image.create({ src });
  if (replace) {
    view.dispatch(view.state.tr.replaceSelectionWith(node));
  } else {
    view.dispatch(view.state.tr.insert(pos, node));
  }
}

export default function MiniEditor({ content, onChange, placeholder = "Adicione uma descrição...", minHeight = 180 }: MiniEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false }),
      Image.configure({ inline: true, allowBase64: true }),
      Link.configure({ openOnClick: false, autolink: true }),
      Underline,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
    editorProps: {
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items;
        if (!items) return false;
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.startsWith("image/")) {
            event.preventDefault();
            const file = items[i].getAsFile();
            if (file) {
              compressImage(file).then((src) => {
                insertImage(view, src, view.state.selection.from, true);
              });
            }
            return true;
          }
        }
        return false;
      },
      handleDrop: (view, event, _slice, moved) => {
        if (moved) return false;
        const files = event.dataTransfer?.files;
        if (!files || files.length === 0) return false;
        for (let i = 0; i < files.length; i++) {
          if (files[i].type.startsWith("image/")) {
            event.preventDefault();
            const coords = view.posAtCoords({ left: event.clientX, top: event.clientY });
            const pos = coords?.pos ?? view.state.selection.from;
            compressImage(files[i]).then((src) => {
              insertImage(view, src, pos, false);
            });
            return true;
          }
        }
        return false;
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const addLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href;
    const url = window.prompt("URL:", prev);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  const Btn = ({ onClick, active, title, children }: {
    onClick: () => void;
    active?: boolean;
    title: string;
    children: React.ReactNode;
  }) => (
    <Tooltip title={title} arrow enterDelay={500}>
      <IconButton
        size="small"
        onMouseDown={(e) => { e.preventDefault(); onClick(); }}
        sx={{
          width: 26,
          height: 26,
          borderRadius: 1,
          color: active ? "#8270FF" : "#94a3b8",
          bgcolor: active ? alpha("#8270FF", 0.1) : "transparent",
          "&:hover": { bgcolor: alpha("#8270FF", 0.08), color: "#8270FF" },
          transition: "all 0.12s",
        }}
      >
        {children}
      </IconButton>
    </Tooltip>
  );

  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: alpha("#94a3b8", 0.25),
        borderRadius: 2,
        overflow: "hidden",
        transition: "border-color 0.15s",
        "&:focus-within": { borderColor: "#8270FF" },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.25,
          px: 0.75,
          py: 0.375,
          borderBottom: "1px solid",
          borderColor: alpha("#94a3b8", 0.12),
          bgcolor: alpha("#f8fafc", 0.8),
        }}
      >
        <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Negrito">
          <FormatBold sx={{ fontSize: 16 }} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Itálico">
          <FormatItalic sx={{ fontSize: 16 }} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Sublinhado">
          <FormatUnderlined sx={{ fontSize: 16 }} />
        </Btn>
        <Divider orientation="vertical" flexItem sx={{ mx: 0.25, my: 0.5 }} />
        <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Lista">
          <FormatListBulleted sx={{ fontSize: 16 }} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Numerada">
          <FormatListNumbered sx={{ fontSize: 16 }} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Citação">
          <FormatQuote sx={{ fontSize: 16 }} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive("code")} title="Código">
          <Code sx={{ fontSize: 16 }} />
        </Btn>
        <Divider orientation="vertical" flexItem sx={{ mx: 0.25, my: 0.5 }} />
        <Btn onClick={addLink} active={editor.isActive("link")} title="Link">
          <InsertLink sx={{ fontSize: 16 }} />
        </Btn>
      </Box>

      <Box
        sx={{
          "& .tiptap": {
            outline: "none",
            minHeight,
            maxHeight: 400,
            overflowY: "auto",
            px: 1.5,
            py: 1.25,
            fontSize: "0.875rem",
            lineHeight: 1.65,
            color: "#1e293b",
            "& p": { mb: 0.75 },
            "& p.is-editor-empty:first-child::before": {
              content: `"${placeholder}"`,
              color: "#94a3b8",
              float: "left",
              pointerEvents: "none",
              height: 0,
            },
            "& ul, & ol": { pl: 2.5, mb: 0.75 },
            "& li": { mb: 0.25 },
            "& blockquote": {
              borderLeft: "2px solid #8270FF",
              pl: 1.5,
              ml: 0,
              color: "#64748b",
              fontStyle: "italic",
            },
            "& code": {
              bgcolor: alpha("#8270FF", 0.08),
              color: "#7c3aed",
              borderRadius: "3px",
              px: 0.5,
              fontFamily: "monospace",
              fontSize: "0.8125rem",
            },
            "& a": {
              color: "#8270FF",
              textDecoration: "underline",
            },
            "& img": {
              maxWidth: "100%",
              height: "auto",
              borderRadius: 1,
              my: 0.5,
            },
          },
        }}
      >
        <EditorContent editor={editor} />
      </Box>
    </Box>
  );
}
