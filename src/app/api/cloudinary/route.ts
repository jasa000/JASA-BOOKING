
import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';
import { collection, getDocs, query } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

async function getUsedImageUrls(firestore: any): Promise<Set<string>> {
    const urls = new Set<string>();

    // Get URLs from events
    const eventsQuery = query(collection(firestore, 'events'));
    const eventsSnapshot = await getDocs(eventsQuery);
    eventsSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.imageUrl) {
            urls.add(data.imageUrl);
        }
    });

    // Get URLs from institutions
    const institutionsQuery = query(collection(firestore, 'institutions'));
    const institutionsSnapshot = await getDocs(institutionsQuery);
    institutionsSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.mainImageUrl) {
            urls.add(data.mainImageUrl);
        }
        if (data.imageUrls && Array.isArray(data.imageUrls)) {
            data.imageUrls.forEach(url => urls.add(url));
        }
    });
    
     // Get URLs from users
    const usersQuery = query(collection(firestore, 'users'));
    const usersSnapshot = await getDocs(usersQuery);
    usersSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.photoURL) {
            urls.add(data.photoURL);
        }
    });

    return urls;
}


export async function GET() {
  try {
    const { firestore } = initializeFirebase();
    if (!firestore) {
        return NextResponse.json({ message: 'Firestore not initialized' }, { status: 500 });
    }
    
    const [cloudinaryResult, usedUrls] = await Promise.all([
        cloudinary.api.resources({ type: 'upload', max_results: 500 }),
        getUsedImageUrls(firestore)
    ]);
    
    const allImages = cloudinaryResult.resources.map((resource: any) => ({
      public_id: resource.public_id,
      url: resource.secure_url,
      created_at: resource.created_at,
      bytes: resource.bytes,
      isUsed: usedUrls.has(resource.secure_url),
    }));

    // Fetch usage details
    const usage: any = await cloudinary.api.usage();

    return NextResponse.json({ images: allImages, usage });

  } catch (error) {
    console.error("Error fetching from Cloudinary:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ message: 'Failed to fetch images', error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
    try {
        const { public_ids } = await request.json();

        if (!public_ids || !Array.isArray(public_ids) || public_ids.length === 0) {
            return NextResponse.json({ message: 'An array of public_ids is required' }, { status: 400 });
        }
        
        // Use `delete_resources` for bulk deletion
        const result = await cloudinary.api.delete_resources(public_ids);

        const deleted = Object.keys(result.deleted);
        const errors = Object.keys(result.deleted_counts).filter(id => result.deleted_counts[id].state === 'not_found' || result.deleted_counts[id].state === 'error');
        
        if (errors.length > 0) {
           console.error("Errors deleting some resources:", result);
        }

        if (deleted.length === 0 && errors.length > 0) {
            throw new Error('Failed to delete any of the specified images from Cloudinary.');
        }

        return NextResponse.json({ message: 'Images processed successfully', deleted, errors });

    } catch (error) {
        console.error("Error deleting from Cloudinary:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        return NextResponse.json({ message: 'Failed to delete images', error: errorMessage }, { status: 500 });
    }
}

    