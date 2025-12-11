import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ImageIcon } from 'lucide-react';

interface StorageImageProps {
  path: string;
  alt: string;
  className?: string;
}

export function StorageImage({ path, alt, className = '' }: StorageImageProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function getImageUrl() {
      if (!path) {
        setLoading(false);
        return;
      }

      try {
        // Clean the path - remove 'storage/lessons/' prefix if present
        let cleanPath = path
          .replace(/^storage\/lessons\//, '')
          .replace(/^\//, '');

        const { data, error: urlError } = await supabase.storage
          .from('lessons')
          .createSignedUrl(cleanPath, 3600);

        if (urlError) {
          console.error('Error getting signed URL:', urlError);
          setError(true);
        } else if (data?.signedUrl) {
          setUrl(data.signedUrl);
        }
      } catch (err) {
        console.error('Error loading image:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    getImageUrl();
  }, [path]);

  if (loading) {
    return (
      <div className={`bg-muted animate-pulse rounded-lg flex items-center justify-center ${className}`} style={{ minHeight: '200px' }}>
        <ImageIcon className="h-8 w-8 text-muted-foreground" />
      </div>
    );
  }

  if (error || !url) {
    return (
      <div className={`bg-muted/50 border-2 border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center ${className}`} style={{ minHeight: '200px' }}>
        <div className="text-center text-muted-foreground p-4">
          <ImageIcon className="h-8 w-8 mx-auto mb-2" />
          <p className="text-sm">Image: {path}</p>
        </div>
      </div>
    );
  }

  return (
    <img 
      src={url} 
      alt={alt} 
      className={`rounded-lg ${className}`}
      onError={() => setError(true)}
    />
  );
}
