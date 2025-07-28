const Footer = () => {
  return (
    <footer className="fixed bottom-0 flex items-center justify-between w-full px-20 py-4 bg-slate-800 text-slate-400 border-t border-slate-700 select-none">
      <p>FacturaX - <span className='text-sm gray-200'>producto sin fines de lucro</span></p>
      <a href='https://julscatalan.dev' target='_blank' className="hover:text-white/80 transition-all">Made by Juls</a>
    </footer>
  );
};

export default Footer;
