from typing import Dict, List

class Memory:
    def __init__(self):
        self.short_term = []
        self.long_term = {}
    
    def add(self, item: Dict):
        self.short_term.append(item)
        
    def get_recent_context(self) -> List[Dict]:
        return self.short_term[-5:]  # Last 5 interactions 