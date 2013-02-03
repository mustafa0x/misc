set guifont=Anonymous\ Pro\ 14
set guioptions=aiA
colorscheme fruidle
set number

set nocompatible
set hlsearch
set nowrap
set autoindent

set lsp=2

set hidden "buffers are hidden. save undo history

set shiftwidth=4 tabstop=4
autocmd FileType html,htmldjango setlocal shiftwidth=2 tabstop=2 expandtab
autocmd FileType python setlocal shiftwidth=4 tabstop=4 expandtab

nnoremap <C-Tab> :bnext<CR>
nnoremap <C-S-Tab> :bprevious<CR>
command! -nargs=* Wrap set wrap linebreak nolist
"(v)noremap  y "*y
"(v)noremap  Y "*Y
"(v)noremap  p "*p
"(v)noremap  P "*P

" delete without yanking
nnoremap <leader>d "_d
vnoremap <leader>d "_d

" replace currently selected text with default register
" without yanking it
vnoremap <leader>p "_dP

" :e %%/ expands to :e cwd/
cabbr <expr> %% expand('%:p:h')
:cd ~/dev

" doesn't load sparkup/ftplugin
execute pathogen#infect()
" call pathogen#runtime_append_all_bundles()

" FuzzyFinder shortcuts
nmap ,f :FufFileWithCurrentBufferDir<CR>
nmap ,b :FufBuffer<CR>
nmap ,t :FufTaggedFile<CR>

" IndentGuides Setup & Config
autocmd VimEnter * IndentGuidesEnable
let g:indent_guides_color_change_percent = 2
let g:indent_guides_guide_size = 1

let g:EasyMotion_leader_key = '<Leader>'

" place swap and backup files in /tmp instead of cwd
set bdir-=.
set bdir+=/tmp
set dir-=.
set dir+=/tmp
