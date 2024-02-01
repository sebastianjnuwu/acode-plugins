import plugin from '../plugin.json';
import style from './styles/style.scss';
import css from './styles/bulma.min.css';

class bulma {
  
  async get_style() {
  
   const regex = /\.(?!\d)([\w-]+)/g;
   const Class = new Set();
   let match;
  
   while ((match = regex.exec(css))) {
     Class.add(match[1]);
   };

   return Array.from(Class);
   
  };

  async completion(_class) {
    
   const completion = {
  
    getCompletions: (editor, session, pos, prefix, callback) => {
   
   if (session.getMode().$id === 'ace/mode/html' || session.getMode().$id === 'ace/mode/jsx') {
     
   let line = session.getLine(pos.row).substr(0, pos.column);
   
   if (line.includes('class="') || line.includes('className="')) {
  
     callback(null, _class.map((word) => {
      return {
        caption: word,
        value: word,
        meta: "bulma"
      };
    }));
     return;
     
    } else {
      callback(null, []);
     }
    }
    
   callback(null, []);
   
     }
   };
   
    editorManager.editor.completers.unshift(completion);
    
  };

  async init() {
   
   this.style = <style textContent={style}></style>;
   document.head.append(this.style);
   
   const word = await this.get_style();
   this.completion(word);
  
  };
  
  async destroy() {
    this.completion([]);
  };
  
};

if (window.acode) {

  acode.setPluginInit(plugin.id, () => new bulma().init());
  
  acode.setPluginUnmount(plugin.id, () => new bulma().destroy());

};