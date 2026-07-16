"""Generate uniform, closed and material-ready bead jewelry assets."""

import math
import os
import bpy

ROOT = os.path.join(os.path.dirname(__file__), "..", "public", "models")


def reset():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for item in list(bpy.data.materials):
        bpy.data.materials.remove(item)


def make_material(name, color, metallic=0.0, roughness=0.18):
    item = bpy.data.materials.new(name)
    item.diffuse_color = (*color, 1)
    item.metallic = metallic
    item.roughness = roughness
    return item


def smooth(obj):
    for polygon in obj.data.polygons:
        polygon.use_smooth = True


def bead(location, radius, material, name="BeadPrimary"):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=12, radius=radius, location=location)
    obj = bpy.context.object
    obj.name = name
    obj.data.materials.append(material)
    smooth(obj)


def export(filename):
    os.makedirs(ROOT, exist_ok=True)
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.export_scene.gltf(filepath=os.path.join(ROOT, filename), export_format="GLB", export_materials="EXPORT")


def necklace(filename, count, radius, color, roughness):
    reset()
    primary = make_material("BeadPrimary", color, roughness=roughness)
    thread = make_material("Thread", (0.16, 0.14, 0.12), roughness=0.6)
    for index in range(count):
        angle = math.pi + math.pi * index / (count - 1)
        x = 2.38 * math.cos(angle)
        z = 0.92 * math.sin(angle)
        bead((x, 0, z), radius, primary)
    curve = bpy.data.curves.new("Thread", "CURVE")
    curve.dimensions = "3D"
    curve.bevel_depth = 0.012
    spline = curve.splines.new("POLY")
    spline.points.add(count - 1)
    for index in range(count):
        angle = math.pi + math.pi * index / (count - 1)
        spline.points[index].co = (2.38 * math.cos(angle), 0, 0.92 * math.sin(angle), 1)
    thread_obj = bpy.data.objects.new("Thread", curve)
    bpy.context.collection.objects.link(thread_obj)
    thread_obj.data.materials.append(thread)
    export(filename)


def bracelet(filename, count, radius, color, roughness, charm=False):
    reset()
    primary = make_material("BeadPrimary", color, roughness=roughness)
    accent = make_material("AccentGold", (0.84, 0.63, 0.16), metallic=0.95, roughness=0.18)
    major = 1.16
    for index in range(count):
        angle = 2 * math.pi * index / count
        bead((major * math.cos(angle), 0, major * math.sin(angle)), radius, primary)
    if charm:
        for angle in (math.radians(258), math.radians(282)):
            bpy.ops.mesh.primitive_torus_add(major_radius=0.115, minor_radius=0.035, major_segments=32,
                                             minor_segments=10, location=(major * math.cos(angle), -0.04, major * math.sin(angle)),
                                             rotation=(math.pi / 2, 0, 0))
            spacer = bpy.context.object
            spacer.name = "AccentGold spacer"
            spacer.data.materials.append(accent)
            smooth(spacer)
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=3, radius=0.15, location=(0, -0.05, -1.43))
        charm_obj = bpy.context.object
        charm_obj.name = "AccentGold charm"
        charm_obj.scale = (0.78, 0.55, 1.15)
        charm_obj.data.materials.append(accent)
        smooth(charm_obj)
    export(filename)


necklace("necklace_jade_bead_studio.glb", 42, 0.095, (0.16, 0.58, 0.39), 0.18)
necklace("necklace_pearl_studio.glb", 44, 0.09, (0.96, 0.91, 0.84), 0.27)
bracelet("bracelet_jade_studio.glb", 16, 0.16, (0.16, 0.58, 0.39), 0.18)
bracelet("bracelet_pearl_studio.glb", 19, 0.135, (0.96, 0.91, 0.84), 0.27)
bracelet("bracelet_crystal_studio.glb", 16, 0.155, (0.72, 0.84, 0.86), 0.08)
