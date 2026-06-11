import * as THREE from 'three';
import { ART_COLORS } from '../../assets/palettes.js';
import { applyAssetMetadata } from '../../assets/manifest.js';
import { createToonMaterial, createEmissiveAccentMaterial } from '../materials/animeToon.js';
import { addToonOutline } from '../utils/outline.js';
import { createBlobShadow, createLantern, mesh } from './propFactory.js';

function npcStyle(npc) {
  if (npc.id?.includes('scholar')) return { id: 'npc_scholar', robe: 0x5a6da0, accent: ART_COLORS.paleGold, prop: 'book' };
  if (npc.id?.includes('hunter')) return { id: 'npc_hunter', robe: 0x44604a, accent: 0x9f7a4f, prop: 'bow' };
  if (npc.id?.includes('trader')) return { id: 'npc_villager', robe: 0xa8584a, accent: ART_COLORS.mutedGold, prop: 'pack' };
  return { id: 'npc_villager', robe: 0xc9b08a, accent: 0x6b5340, prop: 'basket' };
}

export function createNpcAsset(npc, context = {}) {
  const style = npcStyle(npc);
  const group = new THREE.Group();
  const robe = createToonMaterial({ color: style.robe });
  const skin = createToonMaterial({ color: 0xe8cfa8 });
  const body = mesh(new THREE.CylinderGeometry(0.56, 0.74, 1.55, 7), robe, {
    position: { y: 0.85 },
    name: 'npc_body'
  });
  const head = mesh(new THREE.SphereGeometry(0.38, 9, 7), skin, {
    position: { y: 1.86 },
    name: 'npc_head'
  });
  const hair = mesh(new THREE.SphereGeometry(0.4, 9, 5, 0, Math.PI * 2, 0, Math.PI / 2), createToonMaterial({ color: 0x3a2f2a }), {
    position: { y: 2.02 },
    name: 'npc_hair'
  });
  group.add(createBlobShadow(0.72, 0.18), body, head, hair);

  if (style.prop === 'book') {
    group.add(mesh(new THREE.BoxGeometry(0.55, 0.12, 0.38), createToonMaterial({ color: 0xe8e0d0 }), {
      position: { x: 0.42, y: 1.18, z: -0.35 },
      rotation: { z: -0.2 },
      name: 'scholar_book'
    }));
    const lantern = createLantern(ART_COLORS.paleGold, 0.12);
    lantern.position.set(-0.45, 1.18, -0.32);
    group.add(lantern);
  } else if (style.prop === 'bow') {
    group.add(mesh(new THREE.TorusGeometry(0.54, 0.025, 5, 24, Math.PI * 1.35), createToonMaterial({ color: style.accent }), {
      position: { x: -0.55, y: 1.15, z: 0.2 },
      rotation: { z: Math.PI / 2.2 },
      name: 'hunter_bow'
    }));
  } else {
    group.add(mesh(new THREE.BoxGeometry(0.42, 0.52, 0.28), createToonMaterial({ color: style.accent }), {
      position: { x: -0.45, y: 1.02, z: 0.38 },
      rotation: { z: -0.08 },
      name: 'npc_pack'
    }));
  }

  applyAssetMetadata(group, style.id, { category: 'npc' });
  addToonOutline(group, {
    category: 'npc',
    enabled: context.quality?.outlineEnabled ?? true,
    qualityScale: context.quality?.outlineScale ?? 1
  });
  return group;
}
