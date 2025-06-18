"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MdShare, MdContentCopy, MdCheck } from 'react-icons/md';
import { FaWhatsapp, FaFacebook, FaTwitter } from 'react-icons/fa';

interface ShareButtonProps {
  url?: string;
  title?: string;
  description?: string;
  className?: string;
}

export function ShareButton({ 
  url = typeof window !== 'undefined' ? window.location.href : '',
  title = "Prestador New Fest",
  description = "Confira este prestador incrível no New Fest!",
  className = ""
}: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareData = {
    title,
    text: description,
    url,
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Compartilhamento cancelado');
      }
    } else {
      setIsOpen(!isOpen);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Falha ao copiar URL');
    }
  };

  const shareToWhatsApp = () => {
    const text = encodeURIComponent(`${shareData.text}\n\n${url}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const shareToFacebook = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(fbUrl, '_blank');
  };

  const shareToTwitter = () => {
    const text = encodeURIComponent(shareData.text);
    const twitterUrl = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank');
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleNativeShare}
        className={`flex items-center gap-2 border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-[#FF0080] transition-all duration-300 ${className}`}
      >
        <MdShare className="text-xl" />
        Compartilhar
      </motion.button>

      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-4 min-w-[280px] z-50"
          >
            <div className="space-y-3">
              <h4 className="font-semibold text-[#520029] mb-3">Compartilhar prestador</h4>
              
              <button
                onClick={copyToClipboard}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                {copied ? (
                  <MdCheck className="text-green-500 text-xl" />
                ) : (
                  <MdContentCopy className="text-gray-600 text-xl" />
                )}
                <span className="text-sm text-gray-700">
                  {copied ? 'Link copiado!' : 'Copiar link'}
                </span>
              </button>

              <button
                onClick={shareToWhatsApp}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <FaWhatsapp className="text-green-500 text-xl" />
                <span className="text-sm text-gray-700">WhatsApp</span>
              </button>

              <button
                onClick={shareToFacebook}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <FaFacebook className="text-blue-600 text-xl" />
                <span className="text-sm text-gray-700">Facebook</span>
              </button>

              <button
                onClick={shareToTwitter}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <FaTwitter className="text-blue-400 text-xl" />
                <span className="text-sm text-gray-700">Twitter</span>
              </button>
            </div>
          </motion.div>

          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
        </>
      )}
    </div>
  );
}
