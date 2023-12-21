import plugin from '../plugin.json';
import style from './styles/style.scss';

class materializecss {
  
  async fetch() {
    
   const res = await fetch(plugin.url).then((x) => x.text()).catch(() => {});
  
   const regex = /\.(?!\d)([\w-]+)/g;
   const Class = new Set();
   let match;
  
   while ((match = regex.exec(res))) {
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
        meta: "materializecss"
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

  async init(cache) {
   
   this.file = cache.cacheFile;
   this.style = <style textContent={style}></style>;
   document.head.append(this.style);
   
   const materializecss = await this.file.readFile('utf8');
  
   if (!materializecss) {
    const word = await this.fetch();
    await this.file.writeFile(JSON.stringify(word));
    this.completion(word);
    return;
  };
   
    this.completion(JSON.parse(materializecss));
  
  };
  
  async destroy() {
    this.completion([]);
  };
  
};

if (window.acode) {

  acode.setPluginInit(plugin.id, (url, page, cache) => new materializecss().init(cache));

  acode.setPluginUnmount(plugin.id, () => new materializecss().destroy());

};