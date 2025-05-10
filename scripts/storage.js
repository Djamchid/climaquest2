export const loadProgress=()=>JSON.parse(localStorage.getItem('phonix-progress')||'{}');
export const saveProgress=d=>localStorage.setItem('phonix-progress',JSON.stringify(d));