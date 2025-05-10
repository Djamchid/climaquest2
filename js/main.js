body{
  font-family: Arial, Helvetica, sans-serif;
  margin: 0;
  padding: 1rem;
}
#hud{
  margin-bottom: 0.5rem;
  font-weight:bold;
}
canvas{
  border:1px solid #333;
  display:block;
  margin-bottom:1rem;
}
.actions{
  display:flex;
  flex-wrap:wrap;
  gap:0.5rem;
  margin-bottom: 1rem;
}
.action-btn{
  padding:0.5rem 1rem;
  cursor:pointer;
  border:1px solid #666;
  border-radius:4px;
  background:#e0e0e0;
}
.action-btn:disabled{
  opacity:0.5;
  cursor:not-allowed;
}
.investments {
  margin-bottom: 1rem;
  border: 1px solid #eee;
  padding: 0.5rem;
  max-height: 150px;
  overflow-y: auto;
}
.investment-item {
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  background-color: #f0fff0;
  border-radius: 4px;
}
