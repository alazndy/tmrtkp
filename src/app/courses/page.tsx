'use client';

import { useState, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { useAuthStore } from '@/lib/auth-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Clock, TurkishLira, Plus, Pencil, Trash2, Loader2, Languages } from 'lucide-react';
import { toast } from 'sonner';
import { Course } from '@/types';

// Predefined categories
const COURSE_CATEGORIES = [
  'Türk İşaret Dili',
  'İngilizce',
  'Almanca',
  'Türkçe',
  'Diğer',
];

export default function CoursesPage() {
  const { courses, getEnrollmentsWithDetails, addCourse, updateCourse, deleteCourse } = useAppStore();
  const { isAdmin } = useAuthStore();
  const allEnrollments = getEnrollmentsWithDetails();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(COURSE_CATEGORIES[0]);
  const [durationDays, setDurationDays] = useState('30');
  const [price, setPrice] = useState('0');

  // Get unique categories from existing courses
  const availableCategories = useMemo(() => {
    const cats = new Set(courses.map(c => c.category || 'Diğer'));
    return ['all', ...Array.from(cats)];
  }, [courses]);

  // Filter courses by category
  const filteredCourses = useMemo(() => {
    if (selectedCategory === 'all') return courses;
    return courses.filter(c => (c.category || 'Diğer') === selectedCategory);
  }, [courses, selectedCategory]);

  const handleOpenDialog = (course?: Course) => {
    if (course) {
      setEditingCourse(course);
      setName(course.name);
      setDescription(course.description);
      setCategory(course.category || COURSE_CATEGORIES[0]);
      setDurationDays(course.durationDays.toString());
      setPrice(course.price.toString());
    } else {
      setEditingCourse(null);
      setName('');
      setDescription('');
      setCategory(COURSE_CATEGORIES[0]);
      setDurationDays('30');
      setPrice('0');
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin()) {
      toast.error('Bu işlem için yetkiniz yok');
      return;
    }

    setIsLoading(true);
    try {
      const courseData = {
        name,
        description,
        category,
        durationDays: parseInt(durationDays),
        price: parseFloat(price),
      };

      if (editingCourse) {
        await updateCourse(editingCourse.id, courseData);
        toast.success('Kurs güncellendi');
      } else {
        await addCourse(courseData);
        toast.success('Yeni kurs eklendi');
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error(error);
      toast.error('İşlem başarısız oldu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu kursu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) return;
    if (!isAdmin()) return;

    try {
      await deleteCourse(id);
      toast.success('Kurs silindi');
    } catch (error) {
      console.error(error);
      toast.error('Silme işlemi başarısız');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Kurslar</h1>
          <p className="text-muted-foreground">Kurumunuzdaki mevcut kurslar</p>
        </div>
        {isAdmin() && (
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Yeni Kurs Ekle
          </Button>
        )}
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="bg-muted/50 flex-wrap h-auto gap-1 p-1">
          {availableCategories.map((cat) => (
            <TabsTrigger key={cat} value={cat} className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              {cat === 'all' ? 'Tümü' : cat}
              <Badge variant="outline" className="ml-2 text-xs">
                {cat === 'all' ? courses.length : courses.filter(c => (c.category || 'Diğer') === cat).length}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredCourses.map((course) => {
          const activeEnrollments = allEnrollments.filter(
            (e) => e.courseId === course.id && e.status === 'active'
          );
          
          return (
            <Card key={course.id} className="relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary/50" />
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="text-xs">
                        <Languages className="h-3 w-3 mr-1" />
                        {course.category || 'Diğer'}
                      </Badge>
                    </div>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      {course.name}
                    </CardTitle>
                    <CardDescription className="mt-1 line-clamp-2">
                      {course.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      Süre
                    </span>
                    <span className="font-medium">{course.durationDays} gün</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <TurkishLira className="h-4 w-4" />
                      Ücret
                    </span>
                    <span className="font-medium">{course.price.toLocaleString('tr-TR')}₺</span>
                  </div>
                  <div className="pt-2 border-t">
                    <Badge variant={activeEnrollments.length > 0 ? 'default' : 'secondary'}>
                      {activeEnrollments.length} aktif öğrenci
                    </Badge>
                  </div>
                </div>
              </CardContent>
              {isAdmin() && (
                <CardFooter className="bg-muted/50 p-3 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(course)}>
                    <Pencil className="h-4 w-4 mr-1" />
                    Düzenle
                  </Button>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(course.id)}>
                    <Trash2 className="h-4 w-4 mr-1" />
                    Sil
                  </Button>
                </CardFooter>
              )}
            </Card>
          );
        })}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Languages className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Bu kategoride henüz kurs bulunmuyor.</p>
          {isAdmin() && (
            <Button variant="outline" className="mt-4" onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              İlk Kursu Ekle
            </Button>
          )}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCourse ? 'Kursu Düzenle' : 'Yeni Kurs Ekle'}</DialogTitle>
            <DialogDescription>
              Kurs bilgilerini aşağıdan düzenleyebilirsiniz.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category">Kategori / Dil</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Kategori seçin" />
                </SelectTrigger>
                <SelectContent>
                  {COURSE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Kurs Adı</Label>
              <Input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Örn: A1.1 Başlangıç" 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Açıklama</Label>
              <Textarea 
                id="description" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Kurs içeriği hakkında kısa bilgi..." 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Süre (Gün)</Label>
                <Input 
                  id="duration" 
                  type="number" 
                  min="1"
                  value={durationDays} 
                  onChange={(e) => setDurationDays(e.target.value)} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Ücret (₺)</Label>
                <Input 
                  id="price" 
                  type="number" 
                  min="0"
                  value={price} 
                  onChange={(e) => setPrice(e.target.value)} 
                  required 
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>İptal</Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingCourse ? 'Güncelle' : 'Oluştur'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
