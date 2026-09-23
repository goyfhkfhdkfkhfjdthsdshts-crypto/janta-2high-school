import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { initialAboutSchoolData } from '@/lib/aboutData';
import { AboutSchoolData, SchoolFacilityItem, SchoolPhotoItem } from '@/lib/types';

export async function GET() {
  try {
    const aboutData = db.getAboutSchool();
    return NextResponse.json({ success: true, data: aboutData });
  } catch (error) {
    console.error('Error fetching About School data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch school information' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, payload, performedBy } = body;

    let aboutData: AboutSchoolData = db.getAboutSchool();
    const actor = performedBy || 'School Administrator';

    if (action === 'toggle_highlight') {
      const { highlightId, isFeatured } = payload;
      const updatedHighlights = aboutData.highlights.map((h) =>
        h.id === highlightId ? { ...h, isFeatured: Boolean(isFeatured) } : h
      );
      aboutData = db.updateAboutSchool({ highlights: updatedHighlights }, actor);
      db.logAudit(
        'UPDATE_HIGHLIGHT',
        actor,
        'AboutSchool',
        `Toggled highlight "${highlightId}" featured status to ${isFeatured}`
      );
    } else if (action === 'update_facility') {
      const { facility } = payload as { facility: SchoolFacilityItem };
      const currentFacilities = [...aboutData.facilities];
      const index = currentFacilities.findIndex((f) => f.id === facility.id);
      if (index >= 0) {
        currentFacilities[index] = facility;
      } else {
        currentFacilities.push(facility);
      }
      aboutData = db.updateAboutSchool({ facilities: currentFacilities }, actor);
      db.logAudit(
        'UPDATE_FACILITY',
        actor,
        'AboutSchool',
        `Updated school facility "${facility.title}"`
      );
    } else if (action === 'delete_facility') {
      const { facilityId } = payload;
      const filtered = aboutData.facilities.filter((f) => f.id !== facilityId);
      aboutData = db.updateAboutSchool({ facilities: filtered }, actor);
      db.logAudit(
        'DELETE_FACILITY',
        actor,
        'AboutSchool',
        `Deleted school facility id "${facilityId}"`
      );
    } else if (action === 'add_photo') {
      const { photo } = payload as { photo: SchoolPhotoItem };
      const updatedPhotos = [photo, ...(aboutData.photos || [])];
      aboutData = db.updateAboutSchool({ photos: updatedPhotos }, actor);
      db.logAudit(
        'ADD_PHOTO',
        actor,
        'AboutSchool',
        `Added new gallery photo "${photo.title}"`
      );
    } else if (action === 'delete_photo') {
      const { photoId } = payload;
      const updatedPhotos = (aboutData.photos || []).filter((p) => p.id !== photoId);
      aboutData = db.updateAboutSchool({ photos: updatedPhotos }, actor);
      db.logAudit(
        'DELETE_PHOTO',
        actor,
        'AboutSchool',
        `Removed photo id "${photoId}"`
      );
    } else if (action === 'update_full') {
      aboutData = db.updateAboutSchool(payload, actor);
      db.logAudit(
        'UPDATE_ABOUT_SCHOOL',
        actor,
        'AboutSchool',
        'Updated full About School profile details'
      );
    } else {
      aboutData = db.updateAboutSchool(payload, actor);
      db.logAudit(
        'UPDATE_ABOUT_SECTION',
        actor,
        'AboutSchool',
        `Updated about school section: ${action || 'general'}`
      );
    }

    return NextResponse.json({ success: true, data: aboutData });
  } catch (error) {
    console.error('Error updating About School data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update school information' },
      { status: 500 }
    );
  }
}
