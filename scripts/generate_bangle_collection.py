"""Generate the metal bangle collection with stable PBR material slots."""

import math
import os
import bpy

ROOT = os.path.join(os.path.dirname(__file__), "..", "public", "models")


def reset():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for material in list(bpy.data.materials):
        bpy.data.materials.remove(material)


def make_material(name, color, metallic, roughness):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*color, 1)
    mat.metallic = metallic
    mat.roughness = roughness
    return mat


def smooth(obj):
    for polygon in obj.data.polygons:
        polygon.use_smooth = True


def torus(name, major, minor, material):
    bpy.ops.mesh.primitive_torus_add(major_radius=major, minor_radius=minor, major_segments=128,
                                     minor_segments=24, rotation=(math.pi / 2, 0, 0))
    obj = bpy.context.object
    obj.name = name
    obj.scale.x = 1.16
    obj.data.materials.append(material)
    smooth(obj)
    return obj


def export(name):
    os.makedirs(ROOT, exist_ok=True)
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.export_scene.gltf(filepath=os.path.join(ROOT, name), export_format="GLB", export_materials="EXPORT")


reset()
metal = make_material("Metal", (0.83, 0.62, 0.16), 0.95, 0.2)
torus("Slim bangle", 1.65, 0.105, metal)
export("bangle_slim.glb")

reset()
metal = make_material("Metal", (0.83, 0.62, 0.16), 0.95, 0.18)
curve = bpy.data.curves.new("Open bangle arc", "CURVE")
curve.dimensions = "3D"
curve.bevel_depth = 0.13
curve.bevel_resolution = 5
curve.resolution_u = 12
spline = curve.splines.new("POLY")
count = 96
spline.points.add(count - 1)
for index in range(count):
    angle = math.radians(25 + index * 310 / (count - 1))
    spline.points[index].co = (1.9 * math.cos(angle), 0, 1.62 * math.sin(angle), 1)
arc = bpy.data.objects.new("Metal open cuff", curve)
bpy.context.collection.objects.link(arc)
arc.data.materials.append(metal)
stone_mat = make_material("StonePrimary", (0.82, 0.94, 1.0), 0.05, 0.05)
for angle in (25, 335):
    rad = math.radians(angle)
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=3, radius=0.22,
                                         location=(1.9 * math.cos(rad), 0, 1.62 * math.sin(rad)))
    stone = bpy.context.object
    stone.name = "Stone terminal"
    stone.data.materials.append(stone_mat)
    smooth(stone)
export("bangle_open.glb")

reset()
metal = make_material("Metal", (0.83, 0.62, 0.16), 0.95, 0.22)
torus("Floral bangle", 1.65, 0.16, metal)
stone_mat = make_material("StonePrimary", (0.82, 0.94, 1.0), 0.05, 0.05)
for side in (-0.22, 0.22):
    for flower_angle in (74, 90, 106):
        angle = math.radians(flower_angle)
        center_x, center_z = 1.78 * math.cos(angle), 1.54 * math.sin(angle)
        for petal_index in range(5):
            petal_angle = 2 * math.pi * petal_index / 5
            x = center_x + 0.12 * math.cos(petal_angle)
            z = center_z + 0.12 * math.sin(petal_angle)
            bpy.ops.mesh.primitive_uv_sphere_add(segments=20, ring_count=10, radius=0.09, location=(x, side, z))
            petal = bpy.context.object
            petal.name = "Metal floral petal"
            petal.scale = (1.2, 0.4, 0.72)
            petal.rotation_euler[1] = petal_angle
            petal.data.materials.append(metal)
            smooth(petal)
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=0.065, location=(center_x, side - 0.025, center_z))
        flower_stone = bpy.context.object
        flower_stone.name = "Stone floral center"
        flower_stone.data.materials.append(stone_mat)
        smooth(flower_stone)
export("bangle_floral.glb")
