tmux split-window -h #-h == C-b %
tmux split-window 

tmux select-pane -t 0
tmux split-window 
tmux split-window 

tmux kill-pane -t 1

tmux select-pane -t 0
tmux select-pane -t 1
python3 -m http.server 5566
